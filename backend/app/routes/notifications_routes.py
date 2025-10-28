from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def list_notifications(db: Session = Depends(get_db)):
    """Get notifications - placeholder for future implementation"""
    return {"message": "Notifications feature coming soon", "notifications": []}


@router.post("/read/{notification_id}")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    """Mark notification as read - placeholder for future implementation"""
    return {"status": "ok", "message": "Notification marked as read"}