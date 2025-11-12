from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional, List
from datetime import date, datetime

from app import models, schemas, utils
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency to verify admin authentication"""
    token = credentials.credentials
    admin_user = utils.get_current_admin_user(token, db)
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated or not an admin"
        )
    return admin_user


# ==================== Admin Auth ====================
@router.post("/auth/login")
def admin_login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    """Admin login endpoint - only admins can log in"""
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if not user or not utils.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    access_token = utils.create_access_token({"sub": user.email})
    user_data = schemas.AdminUserOut.from_orm(user)
    # Use .dict() for Pydantic v1
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data.dict()
    }


@router.get("/auth/me", response_model=schemas.AdminUserOut)
def get_admin_profile(admin_user: models.User = Depends(get_current_admin)):
    """Get current admin user profile"""
    return schemas.AdminUserOut.from_orm(admin_user)


@router.post("/auth/logout")
def admin_logout(admin_user: models.User = Depends(get_current_admin)):
    """Admin logout (token invalidation handled client-side)"""
    return {"message": "Logged out successfully"}


# ==================== Dashboard Stats ====================
@router.get("/dashboard/stats")
def get_dashboard_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get comprehensive dashboard statistics"""
    from datetime import timedelta
    from sqlalchemy import distinct, extract
    
    # Get date range (default to current month if not provided)
    if not end_date:
        end_date = datetime.utcnow().date()
    if not start_date:
        # Default to first day of current month
        start_date = end_date.replace(day=1)
    
    # Previous period for comparison
    prev_start = (start_date - timedelta(days=32)).replace(day=1)
    prev_end = start_date - timedelta(days=1)
    
    # Total users
    total_users = db.query(func.count(models.User.user_id)).scalar()
    
    # Active users (users with at least one active policy)
    active_users_query = db.query(func.count(func.distinct(models.UserPolicy.user_id))).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    )
    active_users = active_users_query.scalar()
    
    # Total policies (all user policies)
    total_policies = db.query(func.count(models.UserPolicy.user_policy_id)).scalar()
    
    # Active policies count
    active_policies = db.query(func.count(models.UserPolicy.user_policy_id)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    ).scalar()
    
    # Pending applications
    pending_applications = db.query(func.count(models.UserPolicy.user_policy_id)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.pending_payment
    ).scalar()
    
    # Total revenue (sum of premium_paid for active policies)
    total_revenue = db.query(func.sum(models.UserPolicy.premium_paid)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    ).scalar() or 0
    
    # Claims metrics
    pending_claims = db.query(func.count(models.Claim.claim_id)).filter(
        models.Claim.status.in_([models.ClaimStatus.submitted, models.ClaimStatus.in_review])
    ).scalar()
    
    approved_claims = db.query(func.count(models.Claim.claim_id)).filter(
        models.Claim.status == models.ClaimStatus.approved
    ).scalar()
    
    rejected_claims = db.query(func.count(models.Claim.claim_id)).filter(
        models.Claim.status == models.ClaimStatus.rejected
    ).scalar()
    
    total_claims = pending_claims + approved_claims + rejected_claims
    approval_rate = (approved_claims / total_claims * 100) if total_claims > 0 else 0
    
    # Average premium per policy
    avg_premium = db.query(func.avg(models.UserPolicy.premium_paid)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    ).scalar() or 0
    
    # Month-over-month growth calculations
    current_period_users = db.query(func.count(models.User.user_id)).filter(
        models.User.created_at >= start_date,
        models.User.created_at <= end_date
    ).scalar()
    
    prev_period_users = db.query(func.count(models.User.user_id)).filter(
        models.User.created_at >= prev_start,
        models.User.created_at <= prev_end
    ).scalar()
    
    users_growth = ((current_period_users - prev_period_users) / prev_period_users * 100) if prev_period_users > 0 else 0
    
    current_period_policies = db.query(func.count(models.UserPolicy.user_policy_id)).filter(
        models.UserPolicy.issued_at >= datetime.combine(start_date, datetime.min.time()),
        models.UserPolicy.issued_at <= datetime.combine(end_date, datetime.max.time())
    ).scalar()
    
    prev_period_policies = db.query(func.count(models.UserPolicy.user_policy_id)).filter(
        models.UserPolicy.issued_at >= datetime.combine(prev_start, datetime.min.time()),
        models.UserPolicy.issued_at <= datetime.combine(prev_end, datetime.max.time())
    ).scalar()
    
    policies_growth = ((current_period_policies - prev_period_policies) / prev_period_policies * 100) if prev_period_policies > 0 else 0
    
    current_period_revenue = db.query(func.sum(models.UserPolicy.premium_paid)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active,
        models.UserPolicy.issued_at >= datetime.combine(start_date, datetime.min.time()),
        models.UserPolicy.issued_at <= datetime.combine(end_date, datetime.max.time())
    ).scalar() or 0
    
    prev_period_revenue = db.query(func.sum(models.UserPolicy.premium_paid)).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active,
        models.UserPolicy.issued_at >= datetime.combine(prev_start, datetime.min.time()),
        models.UserPolicy.issued_at <= datetime.combine(prev_end, datetime.max.time())
    ).scalar() or 0
    
    revenue_growth = ((float(current_period_revenue) - float(prev_period_revenue)) / float(prev_period_revenue) * 100) if prev_period_revenue > 0 else 0
    
    # Top insurance types by sales (count of active policies)
    top_types = db.query(
        models.InsuranceType.name,
        func.count(models.UserPolicy.user_policy_id).label('count')
    ).join(
        models.InsurancePlan, models.InsurancePlan.type_id == models.InsuranceType.type_id
    ).join(
        models.UserPolicy, models.UserPolicy.policy_id == models.InsurancePlan.policy_id
    ).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    ).group_by(
        models.InsuranceType.name
    ).order_by(
        func.count(models.UserPolicy.user_policy_id).desc()
    ).limit(5).all()
    
    # Top providers by policy count
    top_providers = db.query(
        models.Provider.name,
        func.count(models.UserPolicy.user_policy_id).label('count')
    ).join(
        models.InsurancePlan, models.InsurancePlan.provider_id == models.Provider.provider_id
    ).join(
        models.UserPolicy, models.UserPolicy.policy_id == models.InsurancePlan.policy_id
    ).filter(
        models.UserPolicy.status == models.UserPolicyStatus.active
    ).group_by(
        models.Provider.name
    ).order_by(
        func.count(models.UserPolicy.user_policy_id).desc()
    ).limit(5).all()
    
    # Monthly revenue trend (last 6 months)
    revenue_trend = []
    for i in range(5, -1, -1):
        month_start = (end_date.replace(day=1) - timedelta(days=32*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_revenue = db.query(func.sum(models.UserPolicy.premium_paid)).filter(
            models.UserPolicy.status == models.UserPolicyStatus.active,
            models.UserPolicy.issued_at >= datetime.combine(month_start, datetime.min.time()),
            models.UserPolicy.issued_at <= datetime.combine(month_end, datetime.max.time())
        ).scalar() or 0
        
        revenue_trend.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": float(month_revenue)
        })
    
    # Monthly applications trend
    applications_trend = []
    for i in range(5, -1, -1):
        month_start = (end_date.replace(day=1) - timedelta(days=32*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_apps = db.query(func.count(models.UserPolicy.user_policy_id)).filter(
            models.UserPolicy.issued_at >= datetime.combine(month_start, datetime.min.time()),
            models.UserPolicy.issued_at <= datetime.combine(month_end, datetime.max.time())
        ).scalar()
        
        applications_trend.append({
            "month": month_start.strftime("%Y-%m"),
            "applications": month_apps
        })
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_policies": total_policies,
        "active_policies": active_policies,
        "pending_applications": pending_applications,
        "pending_claims": pending_claims,
        "total_revenue": float(total_revenue),
        "average_premium": float(avg_premium),
        "users_growth": round(users_growth, 2),
        "policies_growth": round(policies_growth, 2),
        "revenue_growth": round(revenue_growth, 2),
        "approval_rate": round(approval_rate, 2),
        "claims_approved": approved_claims,
        "claims_rejected": rejected_claims,
        "top_insurance_types": [{"name": name, "count": count} for name, count in top_types],
        "top_providers": [{"name": name, "count": count} for name, count in top_providers],
        "revenue_trend": revenue_trend,
        "applications_trend": applications_trend,
    }


# ==================== Users Management ====================
@router.get("/users", response_model=schemas.PaginatedResponse)
def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_admin: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get paginated list of users"""
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            or_(
                models.User.name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    
    if is_admin is not None:
        query = query.filter(models.User.is_admin == is_admin)
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": [schemas.UserOut.from_orm(user) for user in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get user by ID"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.UserOut.from_orm(user)


@router.patch("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_update: dict,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Update user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.items():
        if hasattr(user, key) and key != "user_id" and key != "password_hash":
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return schemas.UserOut.from_orm(user)


@router.post("/users/{user_id}/activate", response_model=schemas.UserOut)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Activate a user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    return schemas.UserOut.from_orm(user)


@router.post("/users/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Deactivate a user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    return schemas.UserOut.from_orm(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete a user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# ==================== User Policies Management ====================
@router.get("/users/{user_id}/policies")
def get_user_policies(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get all policies for a specific user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_policies = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_id == user_id
    ).all()
    
    return [schemas.UserPolicyDetailOut.from_orm(up) for up in user_policies]


@router.post("/users/{user_id}/policies", response_model=schemas.UserPolicyDetailOut)
def create_user_policy(
    user_id: int,
    policy_data: schemas.UserPolicyCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Create a new policy for a user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure user_id matches
    if policy_data.user_id != user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID in request body must match URL parameter"
        )
    
    # Verify policy exists
    policy = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.policy_id == policy_data.policy_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    user_policy = models.UserPolicy(**policy_data.dict())
    db.add(user_policy)
    db.commit()
    db.refresh(user_policy)
    return schemas.UserPolicyDetailOut.from_orm(user_policy)


@router.delete("/users/{user_id}/policies/{user_policy_id}")
def delete_user_policy(
    user_id: int,
    user_policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete a user policy"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id,
        models.UserPolicy.user_id == user_id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="User policy not found")
    
    # Check if there are claims associated with this user policy
    claims_count = db.query(models.Claim).filter(
        models.Claim.user_policy_id == user_policy_id
    ).count()
    
    if claims_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete user policy. There are {claims_count} claim(s) associated with this policy. Please delete the claims first."
        )
    
    db.delete(user_policy)
    db.commit()
    return {"message": "User policy deleted successfully"}


# ==================== User Claims Management ====================
@router.get("/users/{user_id}/claims")
def get_user_claims(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get all claims for a specific user"""
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all user policies for this user
    user_policy_ids = [up.user_policy_id for up in db.query(models.UserPolicy.user_policy_id).filter(
        models.UserPolicy.user_id == user_id
    ).all()]
    
    # Get all claims for these user policies
    if not user_policy_ids:
        return []
    
    claims = db.query(models.Claim).filter(
        models.Claim.user_policy_id.in_(user_policy_ids)
    ).all()
    
    return [schemas.ClaimDetailOut.from_orm(claim) for claim in claims]


# ==================== Policies Management ====================
@router.get("/policies")
def get_policies(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    type_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get paginated list of policies"""
    query = db.query(models.InsurancePlan)
    
    if search:
        query = query.filter(
            or_(
                models.InsurancePlan.name.ilike(f"%{search}%"),
                models.InsurancePlan.description.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(models.InsurancePlan.status == status)
    
    if type_id:
        query = query.filter(models.InsurancePlan.type_id == type_id)
    
    if provider_id:
        query = query.filter(models.InsurancePlan.provider_id == provider_id)
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": [schemas.InsurancePlanDetailOut.from_orm(policy) for policy in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/policies/{policy_id}", response_model=schemas.InsurancePlanDetailOut)
def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get policy by ID"""
    policy = db.query(models.InsurancePlan).filter(models.InsurancePlan.policy_id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return schemas.InsurancePlanDetailOut.from_orm(policy)


@router.post("/policies", response_model=schemas.InsurancePlanDetailOut)
def create_policy(
    policy_data: schemas.InsurancePlanCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Create a new policy"""
    policy = models.InsurancePlan(**policy_data.dict())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return schemas.InsurancePlanDetailOut.from_orm(policy)


@router.patch("/policies/{policy_id}", response_model=schemas.InsurancePlanDetailOut)
def update_policy(
    policy_id: int,
    policy_update: dict,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Update a policy"""
    policy = db.query(models.InsurancePlan).filter(models.InsurancePlan.policy_id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    for key, value in policy_update.items():
        if hasattr(policy, key) and key != "policy_id":
            setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return schemas.InsurancePlanDetailOut.from_orm(policy)


@router.delete("/policies/{policy_id}")
def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete a policy"""
    policy = db.query(models.InsurancePlan).filter(models.InsurancePlan.policy_id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Check for related records that would prevent deletion
    user_policies_count = db.query(models.UserPolicy).filter(
        models.UserPolicy.policy_id == policy_id
    ).count()
    
    if user_policies_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete policy. There are {user_policies_count} user policy/policies associated with this policy. Please delete or reassign the user policies first."
        )
    
    # Check for tariffs
    tariffs_count = db.query(models.Tariff).filter(
        models.Tariff.policy_id == policy_id
    ).count()
    
    if tariffs_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete policy. There are {tariffs_count} tariff(s) associated with this policy. Please delete the tariffs first."
        )
    
    # Check for plan criteria
    criteria_count = db.query(models.PlanCriteria).filter(
        models.PlanCriteria.policy_id == policy_id
    ).count()
    
    if criteria_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete policy. There are {criteria_count} plan criteria associated with this policy. Please delete the criteria first."
        )
    
    # Check for document requirements
    doc_requirements_count = db.query(models.PolicyDocumentRequirement).filter(
        models.PolicyDocumentRequirement.policy_id == policy_id
    ).count()
    
    if doc_requirements_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete policy. There are {doc_requirements_count} document requirement(s) associated with this policy. Please delete the requirements first."
        )
    
    # Check for document versions
    doc_versions_count = db.query(models.PolicyDocumentVersion).filter(
        models.PolicyDocumentVersion.policy_id == policy_id
    ).count()
    
    if doc_versions_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete policy. There are {doc_versions_count} document version(s) associated with this policy. Please delete the versions first."
        )
    
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted successfully"}


# ==================== Claims Management ====================
@router.get("/claims")
def get_claims(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    user_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get paginated list of claims"""
    query = db.query(models.Claim)
    
    if status:
        query = query.filter(models.Claim.status == status)
    
    if user_id:
        query = query.join(models.UserPolicy).filter(models.UserPolicy.user_id == user_id)
    
    if start_date:
        query = query.filter(models.Claim.date_filed >= start_date)
    
    if end_date:
        query = query.filter(models.Claim.date_filed <= end_date)
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": [schemas.ClaimDetailOut.from_orm(claim) for claim in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/claims/{claim_id}", response_model=schemas.ClaimDetailOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get claim by ID"""
    claim = db.query(models.Claim).filter(models.Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return schemas.ClaimDetailOut.from_orm(claim)


@router.post("/claims/{claim_id}/approve", response_model=schemas.ClaimDetailOut)
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Approve a claim"""
    claim = db.query(models.Claim).filter(models.Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim.status = models.ClaimStatus.approved
    db.commit()
    db.refresh(claim)
    return schemas.ClaimDetailOut.from_orm(claim)


@router.post("/claims/{claim_id}/reject")
def reject_claim(
    claim_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Reject a claim"""
    claim = db.query(models.Claim).filter(models.Claim.claim_id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim.status = models.ClaimStatus.rejected
    if reason:
        claim.description = f"{claim.description or ''}\n[Rejected: {reason}]".strip()
    
    db.commit()
    db.refresh(claim)
    return schemas.ClaimDetailOut.from_orm(claim)


# ==================== Providers Management ====================
@router.get("/providers")
def get_providers(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get all providers"""
    providers = db.query(models.Provider).all()
    return [schemas.ProviderOut.from_orm(provider) for provider in providers]


@router.get("/providers/{provider_id}", response_model=schemas.ProviderOut)
def get_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get provider by ID"""
    provider = db.query(models.Provider).filter(models.Provider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return schemas.ProviderOut.from_orm(provider)


@router.post("/providers", response_model=schemas.ProviderOut)
def create_provider(
    provider_data: schemas.ProviderCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Create a new provider"""
    provider = models.Provider(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return schemas.ProviderOut.from_orm(provider)


@router.patch("/providers/{provider_id}", response_model=schemas.ProviderOut)
def update_provider(
    provider_id: int,
    provider_update: dict,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Update a provider"""
    provider = db.query(models.Provider).filter(models.Provider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    for key, value in provider_update.items():
        if hasattr(provider, key) and key != "provider_id":
            setattr(provider, key, value)
    
    db.commit()
    db.refresh(provider)
    return schemas.ProviderOut.from_orm(provider)


@router.delete("/providers/{provider_id}")
def delete_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete a provider"""
    provider = db.query(models.Provider).filter(models.Provider.provider_id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Check if there are any insurance policies associated with this provider
    policies_count = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.provider_id == provider_id
    ).count()
    
    if policies_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete provider. There are {policies_count} insurance policy/policies associated with this provider. Please delete or reassign the policies first."
        )
    
    db.delete(provider)
    db.commit()
    return {"message": "Provider deleted successfully"}


# ==================== Applications Management ====================
@router.get("/applications")
def get_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status (pending_payment, active, expired)"),
    policy_type_id: Optional[int] = None,
    provider_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get paginated list of policy applications (pending_payment by default)"""
    query = db.query(models.UserPolicy)
    
    # Filter by status - default to pending_payment
    if status:
        query = query.filter(models.UserPolicy.status == status)
    else:
        query = query.filter(models.UserPolicy.status == models.UserPolicyStatus.pending_payment)
    
    # Join with policy for filtering
    query = query.join(models.InsurancePlan)
    
    if policy_type_id:
        query = query.filter(models.InsurancePlan.type_id == policy_type_id)
    
    if provider_id:
        query = query.filter(models.InsurancePlan.provider_id == provider_id)
    
    # Search by user name or email
    if search:
        query = query.join(models.User).filter(
            or_(
                models.User.name.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%")
            )
        )
    
    # Order by oldest first (priority queue)
    query = query.order_by(models.UserPolicy.issued_at.asc())
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # Build response with user and policy details
    result_items = []
    for user_policy in items:
        user = db.query(models.User).filter(models.User.user_id == user_policy.user_id).first()
        policy_data = schemas.UserPolicyDetailOut.from_orm(user_policy)
        policy_dict = policy_data.dict()
        policy_dict["user"] = schemas.UserOut.from_orm(user).dict()
        result_items.append(policy_dict)
    
    return {
        "items": result_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/applications/{user_policy_id}", response_model=schemas.ApplicationDetailOut)
def get_application(
    user_policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get full application details with user info and documents"""
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get user
    user = db.query(models.User).filter(models.User.user_id == user_policy.user_id).first()
    
    # Get user documents
    user_documents = db.query(models.UserDocument).filter(
        models.UserDocument.user_id == user_policy.user_id
    ).all()
    
    # Get required documents for the policy
    required_docs = db.query(models.RequiredDocument).join(
        models.PolicyDocumentRequirement
    ).filter(
        models.PolicyDocumentRequirement.policy_id == user_policy.policy_id
    ).all()
    
    # Build response
    policy_detail = schemas.UserPolicyDetailOut.from_orm(user_policy)
    application_data = schemas.ApplicationDetailOut(
        **policy_detail.dict(),
        user=schemas.UserOut.from_orm(user),
        user_documents=[schemas.UserDocumentOut.from_orm(doc) for doc in user_documents],
        required_documents=[schemas.RequiredDocumentOut.from_orm(doc) for doc in required_docs]
    )
    
    return application_data


@router.post("/applications/{user_policy_id}/approve", response_model=schemas.UserPolicyDetailOut)
def approve_application(
    user_policy_id: int,
    approve_data: schemas.ApplicationApproveRequest,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Approve an application and activate the policy"""
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if user_policy.status != models.UserPolicyStatus.pending_payment:
        raise HTTPException(
            status_code=400,
            detail=f"Application is not in pending_payment status (current: {user_policy.status})"
        )
    
    # Activate the policy
    user_policy.start_date = approve_data.start_date
    user_policy.end_date = approve_data.end_date
    user_policy.policy_number = approve_data.policy_number
    user_policy.premium_paid = approve_data.premium_paid
    user_policy.status = models.UserPolicyStatus.active
    
    db.commit()
    db.refresh(user_policy)
    
    return schemas.UserPolicyDetailOut.from_orm(user_policy)


@router.post("/applications/{user_policy_id}/reject", response_model=schemas.UserPolicyDetailOut)
def reject_application(
    user_policy_id: int,
    reject_data: schemas.ApplicationRejectRequest,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Reject an application"""
    user_policy = db.query(models.UserPolicy).filter(
        models.UserPolicy.user_policy_id == user_policy_id
    ).first()
    
    if not user_policy:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if user_policy.status != models.UserPolicyStatus.pending_payment:
        raise HTTPException(
            status_code=400,
            detail=f"Application is not in pending_payment status (current: {user_policy.status})"
        )
    
    # Set status to expired (or we could delete it, but expired is safer for records)
    user_policy.status = models.UserPolicyStatus.expired
    
    # Store rejection reason in a note field if available, or in description
    if reject_data.reason:
        # Note: We don't have a rejection_reason field, so we could add one or use a note field
        # For now, we'll just update the status
        pass
    
    db.commit()
    db.refresh(user_policy)
    
    return schemas.UserPolicyDetailOut.from_orm(user_policy)


# ==================== Bulk Upload Endpoints ====================
@router.post("/upload/policies", response_model=schemas.UploadResponse)
def upload_policies(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Upload insurance policies from CSV or JSON file"""
    errors = []
    records_processed = 0
    records_created = 0
    records_updated = 0
    
    try:
        # Parse file based on extension
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension == 'csv':
            data_list = utils.parse_csv_file(file)
        elif file_extension == 'json':
            data_list = utils.parse_json_file(file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only CSV and JSON files are supported."
            )
        
        # Process each record
        for idx, data in enumerate(data_list):
            records_processed += 1
            try:
                # Validate data
                is_valid, error_msg = utils.validate_policy_data(data, db)
                if not is_valid:
                    errors.append(f"Row {idx + 1}: {error_msg}")
                    continue
                
                policy_data = {
                    'type_id': int(data['type_id']),
                    'provider_id': int(data['provider_id']),
                    'name': data['name'],
                    'description': data.get('description') or None,
                    'duration': data.get('duration') or None,
                    'status': data.get('status', 'active'),
                    'contract_pdf_url': data.get('contract_pdf_url') or None
                }
                
                # Check if policy already exists (by name and provider)
                existing = db.query(models.InsurancePlan).filter(
                    and_(
                        models.InsurancePlan.name == policy_data['name'],
                        models.InsurancePlan.provider_id == policy_data['provider_id']
                    )
                ).first()
                
                if existing:
                    # Update existing policy
                    for key, value in policy_data.items():
                        if value is not None and key != 'policy_id':
                            setattr(existing, key, value)
                    records_updated += 1
                else:
                    # Create new policy
                    policy = models.InsurancePlan(**policy_data)
                    db.add(policy)
                    records_created += 1
                
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        db.commit()
        
        return schemas.UploadResponse(
            message="Upload completed",
            records_processed=records_processed,
            records_created=records_created,
            records_updated=records_updated,
            errors=errors
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


@router.post("/upload/tariffs", response_model=schemas.UploadResponse)
def upload_tariffs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Upload tariff data from CSV, JSON, or Excel (.xlsx) file"""
    errors = []
    records_processed = 0
    records_created = 0
    records_updated = 0
    
    # Batch size for commits to avoid too many parameters in a single SQL statement
    # Increased to 100 for better performance - SQLAlchemy can handle this many parameters
    BATCH_SIZE = 100
    
    try:
        # Parse file based on extension
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension == 'csv':
            data_list = utils.parse_csv_file(file)
        elif file_extension == 'json':
            data_list = utils.parse_json_file(file)
        elif file_extension in ['xlsx', 'xls']:
            if file_extension == 'xls':
                raise HTTPException(
                    status_code=400,
                    detail="Old Excel format (.xls) is not supported. Please convert to .xlsx format."
                )
            data_list = utils.parse_excel_file(file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only CSV, JSON, and Excel (.xlsx) files are supported."
            )
        
        # Pre-load all existing tariffs into memory for fast duplicate checking
        # This avoids a database query for every single record
        print(f"Pre-loading existing tariffs for duplicate checking...")
        existing_tariffs_map = {}
        all_existing_tariffs = db.query(models.Tariff).all()
        for tariff in all_existing_tariffs:
            # Create a unique key for duplicate checking
            key = (
                tariff.policy_id,
                tariff.age_min,
                tariff.age_max,
                tariff.class_type,
                tariff.family_min,
                tariff.family_max,
                tariff.outpatient_coverage_percentage
            )
            existing_tariffs_map[key] = tariff
        print(f"Loaded {len(existing_tariffs_map)} existing tariffs into memory")
        
        # Process each record
        for idx, data in enumerate(data_list):
            records_processed += 1
            try:
                # Normalize data keys (handle case variations and spaces)
                normalized_data = {}
                for key, value in data.items():
                    # Normalize key: lowercase, replace spaces/underscores/dashes with underscores
                    normalized_key = str(key).strip().lower().replace(' ', '_').replace('-', '_')
                    
                    # Handle common column name variations
                    # Map plan_id to policy_id
                    if normalized_key == 'plan_id':
                        normalized_key = 'policy_id'
                    
                    normalized_data[normalized_key] = value
                
                # Convert string values to appropriate types first (before validation)
                def safe_int(value, default=None):
                    if value is None or value == '':
                        return default
                    try:
                        # Handle Excel numeric types and strings
                        if isinstance(value, (int, float)):
                            return int(value)
                        # Convert string to number
                        return int(float(str(value).strip()))
                    except (ValueError, TypeError, AttributeError):
                        return default
                
                # Pre-convert numeric fields for validation
                if 'policy_id' in normalized_data:
                    normalized_data['policy_id'] = safe_int(normalized_data.get('policy_id'))
                if 'age_min' in normalized_data:
                    normalized_data['age_min'] = safe_int(normalized_data.get('age_min'))
                if 'age_max' in normalized_data:
                    normalized_data['age_max'] = safe_int(normalized_data.get('age_max'))
                if 'family_min' in normalized_data:
                    normalized_data['family_min'] = safe_int(normalized_data.get('family_min'), 1)
                if 'family_max' in normalized_data:
                    normalized_data['family_max'] = safe_int(normalized_data.get('family_max'), 1)
                
                # Validate data
                is_valid, error_msg = utils.validate_tariff_data(normalized_data, db)
                if not is_valid:
                    errors.append(f"Row {idx + 1}: {error_msg}")
                    continue
                
                def safe_float(value):
                    if value is None or value == '':
                        return None
                    try:
                        return float(value)
                    except (ValueError, TypeError):
                        return None
                
                def safe_percentage(value):
                    """Convert percentage value (1-100) to decimal (0-1) format"""
                    if value is None or value == '':
                        return None
                    try:
                        percentage = float(value)
                        # If value is > 1, assume it's a percentage (1-100) and convert to decimal (0-1)
                        if percentage > 1:
                            return percentage / 100.0
                        # If value is <= 1, assume it's already in decimal format (0-1)
                        return percentage
                    except (ValueError, TypeError):
                        return None
                
                tariff_data = {
                    'policy_id': normalized_data.get('policy_id'),  # Already converted above
                    'age_min': normalized_data.get('age_min'),  # Already converted above
                    'age_max': normalized_data.get('age_max'),  # Already converted above
                    'class_type': str(normalized_data.get('class_type', '')).strip(),
                    'family_type': str(normalized_data.get('family_type', '')).strip() if normalized_data.get('family_type') else None,
                    'family_min': normalized_data.get('family_min', 1),  # Already converted above
                    'family_max': normalized_data.get('family_max', 1),  # Already converted above
                    'inpatient_usd': safe_float(normalized_data.get('inpatient_usd')),
                    'total_usd': safe_float(normalized_data.get('total_usd')),
                    'outpatient_coverage_percentage': safe_percentage(normalized_data.get('outpatient_coverage_percentage')),
                    'outpatient_price_usd': safe_float(normalized_data.get('outpatient_price_usd'))
                }
                
                # Validate required fields after conversion
                if tariff_data['policy_id'] is None:
                    errors.append(f"Row {idx + 1}: policy_id is required and must be a valid integer")
                    continue
                if tariff_data['age_min'] is None:
                    errors.append(f"Row {idx + 1}: age_min is required and must be a valid integer")
                    continue
                if tariff_data['age_max'] is None:
                    errors.append(f"Row {idx + 1}: age_max is required and must be a valid integer")
                    continue
                if not tariff_data['class_type']:
                    errors.append(f"Row {idx + 1}: class_type is required")
                    continue
                
                # Check for duplicate tariff using in-memory lookup (much faster than DB query)
                # A tariff is considered duplicate if it has the same:
                # policy_id, age_min, age_max, class_type, family_min, family_max, and outpatient_coverage_percentage
                duplicate_key = (
                    tariff_data['policy_id'],
                    tariff_data['age_min'],
                    tariff_data['age_max'],
                    tariff_data['class_type'],
                    tariff_data['family_min'],
                    tariff_data['family_max'],
                    tariff_data['outpatient_coverage_percentage']
                )
                
                existing_tariff = existing_tariffs_map.get(duplicate_key)
                
                if existing_tariff:
                    # Update existing tariff with new values
                    existing_tariff.family_type = tariff_data['family_type']
                    existing_tariff.inpatient_usd = tariff_data['inpatient_usd']
                    existing_tariff.total_usd = tariff_data['total_usd']
                    existing_tariff.outpatient_coverage_percentage = tariff_data['outpatient_coverage_percentage']
                    existing_tariff.outpatient_price_usd = tariff_data['outpatient_price_usd']
                    records_updated += 1
                else:
                    # Create new tariff entry
                    tariff = models.Tariff(**tariff_data)
                    db.add(tariff)
                    records_created += 1
                    # Add to map so we don't create duplicates within the same upload
                    existing_tariffs_map[duplicate_key] = tariff
                
                # Commit in batches to improve performance
                # Commit every BATCH_SIZE records (created + updated combined)
                total_processed = records_created + records_updated
                if total_processed > 0 and total_processed % BATCH_SIZE == 0:
                    try:
                        db.commit()
                        print(f"Committed batch: {total_processed} records processed so far")
                    except Exception as commit_error:
                        db.rollback()
                        errors.append(f"Row {idx + 1}: Failed to commit batch: {str(commit_error)}")
                        raise  # Re-raise to stop processing
                
            except Exception as e:
                import traceback
                error_detail = str(e)
                # Include more context for debugging
                if hasattr(e, '__class__'):
                    error_detail = f"{e.__class__.__name__}: {error_detail}"
                errors.append(f"Row {idx + 1}: {error_detail}")
                # Log full traceback for debugging (but don't send to user)
                print(f"Error processing row {idx + 1}:")
                print(traceback.format_exc())
        
        # Final commit for any remaining records
        try:
            db.commit()
        except Exception as commit_error:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to commit remaining records: {str(commit_error)}"
            )
        
        # Group errors by type for better reporting
        error_summary = {}
        for error in errors:
            # Extract error type (everything before the colon in the message)
            if ': ' in error:
                error_type = error.split(': ', 1)[1]
                error_summary[error_type] = error_summary.get(error_type, 0) + 1
            else:
                error_summary[error] = error_summary.get(error, 0) + 1
        
        # Limit errors returned to first 100 to avoid huge responses
        # But include a summary of all error types
        limited_errors = errors[:100]
        if len(errors) > 100:
            limited_errors.append(f"... and {len(errors) - 100} more errors (see summary below)")
        
        # Add error summary to the response message
        summary_lines = []
        if error_summary:
            summary_lines.append("Error Summary:")
            for error_type, count in sorted(error_summary.items(), key=lambda x: x[1], reverse=True)[:10]:
                summary_lines.append(f"  - {error_type}: {count} occurrences")
        
        message = "Upload completed"
        if summary_lines:
            message += "\n\n" + "\n".join(summary_lines)
        
        return schemas.UploadResponse(
            message=message,
            records_processed=records_processed,
            records_created=records_created,
            records_updated=records_updated,
            errors=limited_errors
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


@router.post("/upload/criteria", response_model=schemas.UploadResponse)
def upload_criteria(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Upload plan criteria from JSON or Excel file"""
    errors = []
    records_processed = 0
    records_created = 0
    records_updated = 0
    
    try:
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension == 'json':
            data_list = utils.parse_json_file(file)
        elif file_extension in ['xlsx', 'xls']:
            # Parse Excel file and convert to nested structure
            flat_data_list = utils.parse_excel_file(file)
            data_list = utils.parse_criteria_excel_to_json(flat_data_list)
        else:
            raise HTTPException(
                status_code=400,
                detail="Only JSON and Excel (.xlsx) files are supported for criteria uploads."
            )
        
        # Process each record
        for idx, data in enumerate(data_list):
            records_processed += 1
            try:
                if 'policy_id' not in data:
                    errors.append(f"Row {idx + 1}: Missing required field: policy_id")
                    continue
                
                if 'criteria_data' not in data:
                    errors.append(f"Row {idx + 1}: Missing required field: criteria_data")
                    continue
                
                if 'outpatient_criteria_data' not in data:
                    errors.append(f"Row {idx + 1}: Missing required field: outpatient_criteria_data")
                    continue
                
                policy_id = int(data['policy_id'])
                criteria_data = data['criteria_data']
                outpatient_criteria_data = data['outpatient_criteria_data']
                
                # Validate policy exists
                policy = db.query(models.InsurancePlan).filter(
                    models.InsurancePlan.policy_id == policy_id
                ).first()
                if not policy:
                    errors.append(f"Row {idx + 1}: Policy with ID {policy_id} not found")
                    continue
                
                # Validate criteria_data structure
                is_valid, error_msg = utils.validate_criteria_data(criteria_data)
                if not is_valid:
                    errors.append(f"Row {idx + 1}: {error_msg}")
                    continue
                
                # Validate outpatient_criteria_data structure
                is_valid, error_msg = utils.validate_outpatient_criteria_data(outpatient_criteria_data)
                if not is_valid:
                    errors.append(f"Row {idx + 1}: {error_msg}")
                    continue
                
                # Check if criteria already exists for this policy
                existing = db.query(models.PlanCriteria).filter(
                    models.PlanCriteria.policy_id == policy_id
                ).first()
                
                if existing:
                    # Update existing criteria
                    existing.criteria_data = criteria_data
                    existing.outpatient_criteria_data = outpatient_criteria_data
                    records_updated += 1
                else:
                    # Create new criteria
                    plan_criteria = models.PlanCriteria(
                        policy_id=policy_id,
                        criteria_data=criteria_data,
                        outpatient_criteria_data=outpatient_criteria_data
                    )
                    db.add(plan_criteria)
                    records_created += 1
                
            except Exception as e:
                errors.append(f"Row {idx + 1}: {str(e)}")
        
        db.commit()
        
        return schemas.UploadResponse(
            message="Upload completed",
            records_processed=records_processed,
            records_created=records_created,
            records_updated=records_updated,
            errors=errors
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


# ==================== Plan Criteria CRUD ====================
@router.post("/policies/{policy_id}/criteria", response_model=schemas.PlanCriteriaOut)
def create_or_update_criteria(
    policy_id: int,
    criteria_data: schemas.PlanCriteriaUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Create or update criteria for a policy"""
    # Verify policy exists
    policy = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.policy_id == policy_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    # Check if criteria already exists
    existing = db.query(models.PlanCriteria).filter(
        models.PlanCriteria.policy_id == policy_id
    ).first()
    
    if existing:
        # Update existing
        existing.criteria_data = criteria_data.criteria_data.dict()
        existing.outpatient_criteria_data = criteria_data.outpatient_criteria_data.dict()
        db.commit()
        db.refresh(existing)
        return schemas.PlanCriteriaOut.from_orm(existing)
    else:
        # Create new
        plan_criteria = models.PlanCriteria(
            policy_id=policy_id,
            criteria_data=criteria_data.criteria_data.dict(),
            outpatient_criteria_data=criteria_data.outpatient_criteria_data.dict()
        )
        db.add(plan_criteria)
        db.commit()
        db.refresh(plan_criteria)
        return schemas.PlanCriteriaOut.from_orm(plan_criteria)


@router.get("/policies/{policy_id}/criteria", response_model=schemas.PlanCriteriaOut)
def get_policy_criteria(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get criteria for a specific policy"""
    criteria = db.query(models.PlanCriteria).filter(
        models.PlanCriteria.policy_id == policy_id
    ).first()
    
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found for this policy")
    
    return schemas.PlanCriteriaOut.from_orm(criteria)


@router.delete("/policies/{policy_id}/criteria")
def delete_policy_criteria(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete criteria for a policy"""
    criteria = db.query(models.PlanCriteria).filter(
        models.PlanCriteria.policy_id == policy_id
    ).first()
    
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found for this policy")
    
    db.delete(criteria)
    db.commit()
    return {"message": "Criteria deleted successfully"}


# ==================== Tariff CRUD ====================
@router.post("/policies/{policy_id}/tariffs", response_model=List[schemas.TariffOut])
def create_tariffs(
    policy_id: int,
    tariffs: schemas.TariffBulkCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Create tariff entries for a policy (bulk)"""
    # Verify policy exists
    policy = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.policy_id == policy_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    created_tariffs = []
    for tariff_data in tariffs.tariffs:
        # Ensure policy_id matches
        if tariff_data.policy_id != policy_id:
            raise HTTPException(
                status_code=400,
                detail=f"Tariff policy_id {tariff_data.policy_id} does not match URL policy_id {policy_id}"
            )
        
        tariff = models.Tariff(**tariff_data.dict())
        db.add(tariff)
        created_tariffs.append(tariff)
    
    db.commit()
    for tariff in created_tariffs:
        db.refresh(tariff)
    
    return [schemas.TariffOut.from_orm(t) for t in created_tariffs]


@router.get("/policies/{policy_id}/tariffs", response_model=List[schemas.TariffOut])
def get_policy_tariffs(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get all tariffs for a policy"""
    tariffs = db.query(models.Tariff).filter(
        models.Tariff.policy_id == policy_id
    ).all()
    
    return [schemas.TariffOut.from_orm(t) for t in tariffs]


@router.delete("/tariffs/{tariff_id}")
def delete_tariff(
    tariff_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete a specific tariff"""
    tariff = db.query(models.Tariff).filter(
        models.Tariff.tariff_id == tariff_id
    ).first()
    
    if not tariff:
        raise HTTPException(status_code=404, detail="Tariff not found")
    
    db.delete(tariff)
    db.commit()
    return {"message": "Tariff deleted successfully"}


@router.delete("/policies/{policy_id}/tariffs")
def delete_all_policy_tariffs(
    policy_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Delete all tariffs for a specific policy"""
    # Verify policy exists
    policy = db.query(models.InsurancePlan).filter(
        models.InsurancePlan.policy_id == policy_id
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    count = db.query(models.Tariff).filter(
        models.Tariff.policy_id == policy_id
    ).count()
    
    db.query(models.Tariff).filter(
        models.Tariff.policy_id == policy_id
    ).delete()
    db.commit()
    return {"message": f"Successfully deleted {count} tariff(s) for policy {policy_id}"}


# ==================== Admin Logs (Placeholder) ====================
@router.get("/logs")
def get_admin_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Get admin activity logs (placeholder - implement logging system)"""
    # This is a placeholder. In production, you'd have an AdminLog model
    return {
        "items": [],
        "total": 0,
        "page": page,
        "page_size": page_size,
        "total_pages": 0
    }
