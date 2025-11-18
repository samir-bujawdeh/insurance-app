from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth_routes
from app.routes import marketplace_routes, policy_routes, claims_routes, notifications_routes, document_routes, admin_routes
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine, DB_URL_EFFECTIVE, DB_DIALECT
from sqlalchemy import text
from contextlib import asynccontextmanager
import os


def init_database():
    """
    Initialize database schema and ensure required columns exist.
    For production, use Alembic migrations instead of create_all.
    """
    # Ensure tables exist (use Alembic for production migrations)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Ensure Postgres sequence/default exist for users.user_id (safety for legacy migrations)
        if DB_DIALECT == "postgresql":
            try:
                with engine.begin() as conn:
                    # Create sequence if missing
                    conn.execute(text("""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'users_user_id_seq'
                            ) THEN
                                CREATE SEQUENCE users_user_id_seq;
                            END IF;
                        END$$;
                    """))
                    # Set default nextval on users.user_id
                    conn.execute(text("""
                        ALTER TABLE users
                        ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq');
                    """))
                    # Align sequence to max(user_id)
                    conn.execute(text("""
                        SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 0) + 1, false);
                    """))
                    # Add is_admin and is_active columns if they don't exist
                    conn.execute(text("""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='users' AND column_name='is_admin'
                            ) THEN
                                ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;
                            END IF;
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='users' AND column_name='is_active'
                            ) THEN
                                ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
                            END IF;
                        END$$;
                    """))
                    # Add missing columns to tariffs table if they don't exist
                    conn.execute(text("""
                        DO $$
                        BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='tariffs' AND column_name='family_min'
                            ) THEN
                                ALTER TABLE tariffs ADD COLUMN family_min INTEGER DEFAULT 1 NOT NULL;
                            END IF;
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='tariffs' AND column_name='family_max'
                            ) THEN
                                ALTER TABLE tariffs ADD COLUMN family_max INTEGER DEFAULT 1 NOT NULL;
                            END IF;
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='tariffs' AND column_name='outpatient_coverage_percentage'
                            ) THEN
                                ALTER TABLE tariffs ADD COLUMN outpatient_coverage_percentage DOUBLE PRECISION;
                            END IF;
                            IF NOT EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='tariffs' AND column_name='outpatient_price_usd'
                            ) THEN
                                ALTER TABLE tariffs ADD COLUMN outpatient_price_usd NUMERIC(10, 2);
                            END IF;
                        END$$;
                    """))
                    # Drop redundant columns from insurance_plans table if they exist
                    conn.execute(text("""
                        DO $$
                        BEGIN
                            IF EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='insurance_plans' AND column_name='premium'
                            ) THEN
                                ALTER TABLE insurance_plans DROP COLUMN premium;
                            END IF;
                            IF EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='insurance_plans' AND column_name='coverage_summary'
                            ) THEN
                                ALTER TABLE insurance_plans DROP COLUMN coverage_summary;
                            END IF;
                            IF EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE table_name='insurance_plans' AND column_name='exclusions_summary'
                            ) THEN
                                ALTER TABLE insurance_plans DROP COLUMN exclusions_summary;
                            END IF;
                        END$$;
                    """))
            except Exception as _e:
                # Continue; schema setup may still proceed for SQLite or if migration already correct
                print(f"Warning: Could not add admin columns: {_e}")
        elif DB_DIALECT == "sqlite":
            # For SQLite, we'll try to add columns (may fail if table doesn't exist yet)
            try:
                with engine.begin() as conn:
                    # Check if columns exist and add them for users table
                    result = conn.execute(text("PRAGMA table_info(users)"))
                    columns = [row[1] for row in result.fetchall()]
                    if 'is_admin' not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0 NOT NULL"))
                    if 'is_active' not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL"))
                    
                    # Check if columns exist and add them for tariffs table
                    result = conn.execute(text("PRAGMA table_info(tariffs)"))
                    tariff_columns = [row[1] for row in result.fetchall()] if result else []
                    if 'family_min' not in tariff_columns:
                        conn.execute(text("ALTER TABLE tariffs ADD COLUMN family_min INTEGER DEFAULT 1 NOT NULL"))
                    if 'family_max' not in tariff_columns:
                        conn.execute(text("ALTER TABLE tariffs ADD COLUMN family_max INTEGER DEFAULT 1 NOT NULL"))
                    if 'outpatient_coverage_percentage' not in tariff_columns:
                        conn.execute(text("ALTER TABLE tariffs ADD COLUMN outpatient_coverage_percentage REAL"))
                    if 'outpatient_price_usd' not in tariff_columns:
                        conn.execute(text("ALTER TABLE tariffs ADD COLUMN outpatient_price_usd NUMERIC(10, 2)"))
                    
                    # Drop redundant columns from insurance_plans table if they exist
                    result = conn.execute(text("PRAGMA table_info(insurance_plans)"))
                    policy_columns = [row[1] for row in result.fetchall()] if result else []
                    if 'premium' in policy_columns:
                        conn.execute(text("ALTER TABLE insurance_plans DROP COLUMN premium"))
                    if 'coverage_summary' in policy_columns:
                        conn.execute(text("ALTER TABLE insurance_plans DROP COLUMN coverage_summary"))
                    if 'exclusions_summary' in policy_columns:
                        conn.execute(text("ALTER TABLE insurance_plans DROP COLUMN exclusions_summary"))
            except Exception as _e:
                # Table might not exist yet, will be created by Base.metadata.create_all
                print(f"Note: Columns will be added when table is created: {_e}")
                pass
        print("Database initialization complete.")
    except Exception as e:
        print(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    Handles database initialization on startup.
    """
    # Startup
    init_database()
    yield
    # Shutdown (if needed, add cleanup here)


app = FastAPI(title="The Insurance App API", lifespan=lifespan)

# ✅ Enable CORS for all origins (adjust later for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # you can restrict this to your domains later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(marketplace_routes.router)
app.include_router(policy_routes.router)
app.include_router(claims_routes.router)
app.include_router(notifications_routes.router)
app.include_router(document_routes.router)
app.include_router(admin_routes.router)

# Mount static files directory for logos and other static assets
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def root():
    return {"message": "Welcome to The Insurance App"}


@app.get("/_health/db")
def db_healthcheck():
    """Return basic DB connectivity and which database is configured."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        connected = True
    except Exception as e:
        connected = False
    # Redact credentials in URL (show scheme+host+db only when possible)
    try:
        url_str = str(engine.url)
        # Basic redaction: drop credentials if present
        if "@" in url_str and "://" in url_str:
            scheme, rest = url_str.split("://", 1)
            if "@" in rest:
                rest = rest.split("@", 1)[1]
            url_redacted = f"{scheme}://{rest}"
        else:
            url_redacted = url_str
    except Exception:
        url_redacted = "unknown"

    return {
        "connected": connected,
        "dialect": DB_DIALECT,
        "url": url_redacted,
        "using_fallback_sqlite": DB_DIALECT == "sqlite",
    }
