from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
from passlib.context import CryptContext
from typing import List, Tuple
import csv
import json
import io

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

def get_current_admin_user(token: str, db):
    """Verify token and return admin user if authenticated and is_admin=True"""
    from . import models
    email = verify_token(token)
    if email is None:
        return None
    user = db.query(models.User).filter(models.User.email == email).first()
    if user and user.is_admin:
        return user
    return None


# Upload Utilities
def parse_csv_file(file) -> List[dict]:
    """Parse CSV file and return list of dictionaries"""
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer
    text = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(text))
    return list(csv_reader)


def parse_json_file(file) -> List[dict]:
    """Parse JSON file and return list of dictionaries"""
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer
    text = content.decode('utf-8')
    data = json.loads(text)
    if isinstance(data, list):
        return data
    elif isinstance(data, dict):
        return [data]
    else:
        raise ValueError("JSON file must contain an array or object")


def validate_policy_data(data: dict, db) -> Tuple[bool, str]:
    """Validate policy data (check provider_id, type_id exist)"""
    from . import models
    if 'provider_id' not in data:
        return False, "Missing required field: provider_id"
    if 'type_id' not in data:
        return False, "Missing required field: type_id"
    if 'name' not in data:
        return False, "Missing required field: name"
    
    provider = db.query(models.Provider).filter(models.Provider.provider_id == int(data['provider_id'])).first()
    if not provider:
        return False, f"Provider with ID {data['provider_id']} not found"
    
    insurance_type = db.query(models.InsuranceType).filter(models.InsuranceType.type_id == int(data['type_id'])).first()
    if not insurance_type:
        return False, f"Insurance type with ID {data['type_id']} not found"
    
    return True, ""


def validate_tariff_data(data: dict, db) -> Tuple[bool, str]:
    """Validate tariff data (check policy_id exists)"""
    from . import models
    if 'policy_id' not in data:
        return False, "Missing required field: policy_id"
    if 'age_min' not in data:
        return False, "Missing required field: age_min"
    if 'age_max' not in data:
        return False, "Missing required field: age_max"
    if 'class_type' not in data:
        return False, "Missing required field: class_type"
    # family_min and family_max are required but have defaults, so we check if they exist or use defaults
    if 'family_min' not in data:
        data['family_min'] = 1
    if 'family_max' not in data:
        data['family_max'] = 1
    
    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.policy_id == int(data['policy_id'])).first()
    if not policy:
        return False, f"Policy with ID {data['policy_id']} not found"
    
    return True, ""


def validate_criteria_data(data: dict) -> Tuple[bool, str]:
    """Validate criteria_data structure against schema"""
    from . import schemas
    try:
        # Try to parse as PlanCriteriaData
        schemas.PlanCriteriaData(**data)
        return True, ""
    except Exception as e:
        return False, f"Invalid criteria_data structure: {str(e)}"