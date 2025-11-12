from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("/mine", response_model=List[schemas.UserPolicyDetailOut])
def my_policies(
    user_id: int,  # In production, get this from JWT token
    db: Session = Depends(get_db)
):
    """Get user's policies with full details"""
    user_policies = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_id == user_id
    ).all()
    return user_policies


@router.post("/purchase", response_model=schemas.UserPolicyOut)
def purchase_policy(
    user_id: int,
    policy_id: int,
    version_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Purchase a policy (create user policy)"""
    # Verify policy exists
    policy = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.policy_id == policy_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Create user policy
    user_policy = models.UserPolicy(
        user_id=user_id,
        policy_id=policy_id,
        version_id=version_id,
        status=models.UserPolicyStatus.pending_payment
    )
    db.add(user_policy)
    db.commit()
    db.refresh(user_policy)
    return user_policy


@router.put("/{user_policy_id}/activate", response_model=schemas.UserPolicyOut)
def activate_policy(
    user_policy_id: int,
    start_date: date,
    end_date: date,
    policy_number: str,
    premium_paid: float,
    db: Session = Depends(get_db)
):
    """Activate a user policy"""
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id
    ).first()
    if not user_policy:
        raise HTTPException(status_code=404, detail="User policy not found")
    
    user_policy.start_date = start_date
    user_policy.end_date = end_date
    user_policy.policy_number = policy_number
    user_policy.premium_paid = premium_paid
    user_policy.status = models.UserPolicyStatus.active
    
    db.commit()
    db.refresh(user_policy)
    return user_policy


@router.get("/{user_policy_id}", response_model=schemas.UserPolicyDetailOut)
def get_user_policy(user_policy_id: int, db: Session = Depends(get_db)):
    """Get a specific user policy with details"""
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id
    ).first()
    if not user_policy:
        raise HTTPException(status_code=404, detail="User policy not found")
    return user_policy