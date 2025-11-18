from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

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


@router.post("/policies/match", response_model=List[schemas.MatchedPolicyOut])
def match_policies(
    criteria: schemas.PolicyMatchCriteria,
    db: Session = Depends(get_db)
):
    """
    Match insurance policies based on user criteria.
    Returns policies with matching tariffs that fit the user's requirements.
    Groups tariffs by plan and collects all outpatient options as add-ons.
    """
    # Query all active policies
    policies = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.status == "active"
    ).all()
    
    matched_policies = []
    
    for policy in policies:
        # Get all tariffs for this policy
        tariffs = db.query(models.Tariff).filter(
            models.Tariff.policy_id == policy.policy_id
        ).all()
        
        # Find all matching tariffs for this policy
        matching_tariffs = []
        
        for tariff in tariffs:
            # Match class type (case-insensitive comparison)
            if tariff.class_type.upper() != criteria.insurance_class.upper():
                continue
            
            # Match family type
            if criteria.insurance_type == "individual":
                # For individual, check if family_size of 1 falls within the tariff's range
                # This allows tariffs that support both individuals and families (e.g., family_min=1, family_max=100)
                if not (tariff.family_min <= 1 <= tariff.family_max):
                    continue
            else:  # family
                # For family, check if family_size falls within range
                if criteria.family_size is None:
                    continue
                if not (tariff.family_min <= criteria.family_size <= tariff.family_max):
                    continue
            
            # Match primary age
            if not (tariff.age_min <= criteria.primary_age <= tariff.age_max):
                continue
            
            # Match family member ages (if applicable)
            if criteria.insurance_type == "family" and criteria.family_ages:
                all_ages_match = True
                for age in criteria.family_ages:
                    if not (tariff.age_min <= age <= tariff.age_max):
                        all_ages_match = False
                        break
                if not all_ages_match:
                    continue
            
            # If we get here, this tariff matches!
            matching_tariffs.append(tariff)
        
        # If we have matching tariffs, group them and create a single result
        if matching_tariffs:
            # Find base tariff (prefer one with no outpatient coverage or 0%)
            # Use the one with the lowest outpatient_coverage_percentage (or None)
            base_tariff = None
            for tariff in matching_tariffs:
                if base_tariff is None:
                    base_tariff = tariff
                else:
                    # Prefer tariff with no outpatient or 0% outpatient
                    base_outpatient = base_tariff.outpatient_coverage_percentage or 0.0
                    tariff_outpatient = tariff.outpatient_coverage_percentage or 0.0
                    if tariff_outpatient < base_outpatient:
                        base_tariff = tariff
            
            # Collect all outpatient options (all tariffs with outpatient coverage > 0%)
            outpatient_options = []
            for tariff in matching_tariffs:
                # Include as outpatient option if it has outpatient coverage > 0%
                if tariff.outpatient_coverage_percentage is not None and tariff.outpatient_coverage_percentage > 0:
                    outpatient_option = schemas.OutpatientOption(
                        outpatient_coverage_percentage=tariff.outpatient_coverage_percentage,
                        outpatient_price_usd=float(tariff.outpatient_price_usd) if tariff.outpatient_price_usd else None,
                        tariff_id=tariff.tariff_id
                    )
                    outpatient_options.append(outpatient_option)
            
            # Sort outpatient options by percentage (ascending)
            outpatient_options.sort(key=lambda x: x.outpatient_coverage_percentage)
            
            # Create matched policy result with base tariff and outpatient options
            matched_policy = schemas.MatchedPolicyOut(
                policy=schemas.InsurancePlanDetailOut.from_orm(policy),
                matching_tariff=schemas.MatchedTariffOut.from_orm(base_tariff),
                outpatient_options=outpatient_options
            )
            matched_policies.append(matched_policy)
    
    return matched_policies