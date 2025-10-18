from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
from passlib.context import CryptContext

import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes the user password safely."""
    if len(password.encode("utf-8")) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a password against its hash."""
    return pwd_context.verify(plain_password[:72], hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    print("🔹 Raw token received:", token)   # 👈 Add this
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("✅ DECODED PAYLOAD:", payload)
        email: str = payload.get("sub")
        if email is None:
            print("⚠️ No 'sub' in payload")
            return None
        return email
    except JWTError as e:
        print("❌ JWT ERROR:", e)
        return None
