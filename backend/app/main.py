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
    finally:
        db.close()
