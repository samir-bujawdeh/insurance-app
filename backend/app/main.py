from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes
from app.routes import marketplace_routes, policy_routes, claims_routes, notifications_routes, document_routes
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app import models
import random




app = FastAPI(title="The Insurance App API")

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

@app.get("/")
def root():
    return {"message": "Welcome to The Insurance App"}


@app.on_event("startup")
def init_and_seed():
    # Ensure tables exist (use Alembic for production migrations)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        print("Starting database seeding...")
        # Seed providers
        if db.query(models.Provider).count() == 0:
            providers = [
                models.Provider(name="Acme Insurance", contact_info="1-800-ACME-123", rating=4.5),
                models.Provider(name="Blue Shield Co.", contact_info="1-800-BLUE-456", rating=4.2),
                models.Provider(name="Guardian Mutual", contact_info="1-800-GUARD-789", rating=4.7),
            ]
            db.add_all(providers)
            db.commit()

        providers = db.query(models.Provider).all()

        # Seed insurance types
        if db.query(models.InsuranceType).count() == 0:
            insurance_types = [
                models.InsuranceType(name="Auto Insurance", description="Vehicle coverage"),
                models.InsuranceType(name="Home Insurance", description="Property coverage"),
                models.InsuranceType(name="Health Insurance", description="Medical coverage"),
                models.InsuranceType(name="Life Insurance", description="Life coverage"),
            ]
            db.add_all(insurance_types)
            db.commit()

        insurance_types = db.query(models.InsuranceType).all()

        # Seed insurance policies
        if db.query(models.InsurancePolicy).count() == 0:
            for provider in providers:
                for ins_type in insurance_types:
                    base_premium = random.choice([49.99, 79.99, 99.99, 129.99, 199.99])
                    policy = models.InsurancePolicy(
                        type_id=ins_type.type_id,
                        provider_id=provider.provider_id,
                        name=f"{provider.name} {ins_type.name} Basic",
                        description=f"Affordable {ins_type.name.lower()} coverage by {provider.name}",
                        coverage_summary=f"Comprehensive {ins_type.name.lower()} protection",
                        premium=base_premium,
                        duration="12 months",
                        status=models.PolicyStatus.active.value
                    )
                    db.add(policy)
            db.commit()

        # Seed required documents
        if db.query(models.RequiredDocument).count() == 0:
            documents = [
                models.RequiredDocument(
                    name="Driver's License",
                    description="Valid driver's license",
                    file_type="PDF/Image",
                    upload_instructions="Upload front and back of license"
                ),
                models.RequiredDocument(
                    name="Proof of Income",
                    description="Recent pay stubs or tax returns",
                    file_type="PDF",
                    upload_instructions="Upload last 3 months of income documentation"
                ),
                models.RequiredDocument(
                    name="Property Deed",
                    description="Property ownership documentation",
                    file_type="PDF",
                    upload_instructions="Upload property deed or title"
                ),
                models.RequiredDocument(
                    name="Medical Records",
                    description="Recent medical history",
                    file_type="PDF",
                    upload_instructions="Upload relevant medical documentation"
                ),
            ]
            db.add_all(documents)
            db.commit()

        # Seed demo user (if not exists)
        demo_user = db.query(models.User).filter(models.User.email == "demo@example.com").first()
        if not demo_user:
            print("Creating demo user...")
            demo_user = models.User(
                name="Demo User",
                email="demo@example.com",
                phone="+1-555-0123",
                password_hash="demo_password_hash"  # In production, properly hash this
            )
            db.add(demo_user)
            db.flush()  # Use flush instead of commit to get the ID
            db.refresh(demo_user)
            print(f"Demo user created with ID: {demo_user.user_id}")
        else:
            print(f"Demo user already exists with ID: {demo_user.user_id}")

        # Seed demo user policies
        if db.query(models.UserPolicy).count() == 0:
            policies = db.query(models.InsurancePolicy).all()
            demo_user = db.query(models.User).filter(models.User.email == "demo@example.com").first()
            
            if demo_user and policies:
                from datetime import date, datetime, timedelta
                
                # Create demo user policies with different statuses
                demo_policies = [
                    # Active Auto Insurance
                    models.UserPolicy(
                        user_id=demo_user.user_id,
                        policy_id=policies[0].policy_id,  # First policy (Auto)
                        start_date=date.today() - timedelta(days=30),
                        end_date=date.today() + timedelta(days=335),
                        policy_number="AUTO-2024-001",
                        premium_paid=99.99,
                        status=models.UserPolicyStatus.active,
                        issued_at=datetime.utcnow() - timedelta(days=30)
                    ),
                    # Active Home Insurance
                    models.UserPolicy(
                        user_id=demo_user.user_id,
                        policy_id=policies[4].policy_id,  # Home insurance from first provider
                        start_date=date.today() - timedelta(days=60),
                        end_date=date.today() + timedelta(days=305),
                        policy_number="HOME-2024-002",
                        premium_paid=199.99,
                        status=models.UserPolicyStatus.active,
                        issued_at=datetime.utcnow() - timedelta(days=60)
                    ),
                    # Pending Payment Health Insurance
                    models.UserPolicy(
                        user_id=demo_user.user_id,
                        policy_id=policies[8].policy_id,  # Health insurance from first provider
                        policy_number="HEALTH-2024-003",
                        premium_paid=0,
                        status=models.UserPolicyStatus.pending_payment,
                        issued_at=datetime.utcnow() - timedelta(days=5)
                    ),
                    # Expired Life Insurance
                    models.UserPolicy(
                        user_id=demo_user.user_id,
                        policy_id=policies[12].policy_id,  # Life insurance from first provider
                        start_date=date.today() - timedelta(days=400),
                        end_date=date.today() - timedelta(days=40),
                        policy_number="LIFE-2023-004",
                        premium_paid=129.99,
                        status=models.UserPolicyStatus.expired,
                        issued_at=datetime.utcnow() - timedelta(days=400)
                    ),
                    # Another Active Policy (Auto from different provider)
                    models.UserPolicy(
                        user_id=demo_user.user_id,
                        policy_id=policies[1].policy_id,  # Auto from second provider
                        start_date=date.today() - timedelta(days=15),
                        end_date=date.today() + timedelta(days=350),
                        policy_number="AUTO-2024-005",
                        premium_paid=79.99,
                        status=models.UserPolicyStatus.active,
                        issued_at=datetime.utcnow() - timedelta(days=15)
                    ),
                ]
                
                db.add_all(demo_policies)
                db.commit()
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()
