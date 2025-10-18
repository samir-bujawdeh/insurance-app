from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm

from sqlalchemy.orm import Session
from app import models, schemas, utils
from app.database import get_db

from app.database import SessionLocal


router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


@router.get("/test")
def test_route():
    return {"message": "Auth routes working!"}

@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = utils.hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = utils.create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials  # ✅ this extracts only the token string
    print("🟢 Extracted token:", token)  # optional, for debugging

    email = utils.verify_token(token)  # now decode only the raw JWT
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.User).filter(models.User.email == email).first()
    return {"email": user.email, "full_name": user.full_name}
