from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


@router.get("/providers", response_model=List[schemas.ProviderOut])
def list_providers(db: Session = Depends(get_db)):
    """Get all insurance providers"""
    return db.query(models.Provider).all()


@router.get("/insurance-types", response_model=List[schemas.InsuranceTypeOut])
def list_insurance_types(db: Session = Depends(get_db)):
    """Get all insurance types (hierarchical)"""
    return db.query(models.InsuranceType).all()


@router.get("/policies-test")
def test_policies(db: Session = Depends(get_db)):
    """Test endpoint to debug policies issue"""
    try:
        count = db.query(models.InsurancePlan).count()
        return {"count": count, "message": "Policies query successful"}
    except Exception as e:
        return {"error": str(e), "message": "Policies query failed"}


@router.get("/policies", response_model=List[schemas.InsurancePlanOut])
def list_policies(
    type_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all insurance policies with optional filtering"""
    query = db.query(models.InsurancePlan)
    
    if type_id:
        query = query.filter(models.InsurancePlan.type_id == type_id)
    if provider_id:
        query = query.filter(models.InsurancePlan.provider_id == provider_id)
    
    return query.all()


@router.get("/policies/{policy_id}", response_model=schemas.InsurancePlanDetailOut)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    """Get a specific insurance policy with details"""
    policy = db.query(models.InsurancePlan).filter(models.InsurancePlan.policy_id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.get("/policies/{policy_id}/requirements", response_model=List[schemas.PolicyDocumentRequirementOut])
def get_policy_requirements(policy_id: int, db: Session = Depends(get_db)):
    """Get document requirements for a specific policy"""
    requirements = db.query(models.PolicyDocumentRequirement).filter(
        models.PolicyDocumentRequirement.policy_id == policy_id
    ).all()
    return requirements


@router.get("/policies/{policy_id}/versions", response_model=List[schemas.PolicyDocumentVersionOut])
def get_policy_versions(policy_id: int, db: Session = Depends(get_db)):
    """Get all versions of a policy document"""
    versions = db.query(models.PolicyDocumentVersion).filter(
        models.PolicyDocumentVersion.policy_id == policy_id
    ).all()
    return versions


@router.post("/policies", response_model=schemas.InsurancePlanOut)
def create_policy(policy: schemas.InsurancePlanCreate, db: Session = Depends(get_db)):
    """Create a new insurance policy"""
    db_policy = models.InsurancePlan(**policy.dict())
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy


@router.post("/providers", response_model=schemas.ProviderOut)
def create_provider(provider: schemas.ProviderCreate, db: Session = Depends(get_db)):
    """Create a new insurance provider"""
    db_provider = models.Provider(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider


@router.post("/insurance-types", response_model=schemas.InsuranceTypeOut)
def create_insurance_type(insurance_type: schemas.InsuranceTypeCreate, db: Session = Depends(get_db)):
    """Create a new insurance type"""
    db_type = models.InsuranceType(**insurance_type.dict())
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type