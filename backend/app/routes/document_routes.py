from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/required", response_model=List[schemas.RequiredDocumentOut])
def list_required_documents(db: Session = Depends(get_db)):
    """Get all required document types"""
    return db.query(models.RequiredDocument).all()


@router.post("/required", response_model=schemas.RequiredDocumentOut)
def create_required_document(document: schemas.RequiredDocumentCreate, db: Session = Depends(get_db)):
    """Create a new required document type"""
    db_document = models.RequiredDocument(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.get("/user/{user_id}", response_model=List[schemas.UserDocumentOut])
def get_user_documents(user_id: int, db: Session = Depends(get_db)):
    """Get all documents uploaded by a user"""
    return db.query(models.UserDocument).filter(
        models.UserDocument.user_id == user_id
    ).all()


@router.post("/upload", response_model=schemas.UserDocumentOut)
def upload_document(
    user_id: int,
    doc_id: int,
    file_url: str,
    db: Session = Depends(get_db)
):
    """Upload a document for a user"""
    # Verify document type exists
    doc_type = db.query(models.RequiredDocument).filter(
        models.RequiredDocument.doc_id == doc_id
    ).first()
    if not doc_type:
        raise HTTPException(status_code=404, detail="Document type not found")
    
    user_document = models.UserDocument(
        user_id=user_id,
        doc_id=doc_id,
        file_url=file_url
    )
    db.add(user_document)
    db.commit()
    db.refresh(user_document)
    return user_document


@router.put("/{user_doc_id}/verify", response_model=schemas.UserDocumentOut)
def verify_document(user_doc_id: int, verified: bool, db: Session = Depends(get_db)):
    """Mark a document as verified or not"""
    user_document = db.query(models.UserDocument).filter(
        models.UserDocument.user_doc_id == user_doc_id
    ).first()
    if not user_document:
        raise HTTPException(status_code=404, detail="User document not found")
    
    user_document.verified = verified
    db.commit()
    db.refresh(user_document)
    return user_document


@router.post("/policy-requirements", response_model=schemas.PolicyDocumentRequirementOut)
def create_policy_requirement(
    requirement: schemas.PolicyDocumentRequirementCreate,
    db: Session = Depends(get_db)
):
    """Create a document requirement for a policy"""
    db_requirement = models.PolicyDocumentRequirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement
