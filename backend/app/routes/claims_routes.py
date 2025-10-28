from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/claims", tags=["Claims"])


@router.get("/", response_model=List[schemas.ClaimOut])
def list_claims(db: Session = Depends(get_db)):
    return db.query(models.Claim).all()


@router.post("/", response_model=schemas.ClaimOut)
def create_claim(payload: schemas.ClaimCreate, db: Session = Depends(get_db)):
    claim = models.Claim(
        user_policy_id=payload.user_policy_id, 
        claim_amount=payload.claim_amount,
        description=payload.description,
        status=models.ClaimStatus.submitted
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


