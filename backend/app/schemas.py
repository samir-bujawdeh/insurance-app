from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


# Custom field validators for enum serialization
def enum_to_str(v):
    """Convert enum to string for serialization"""
    if hasattr(v, 'value'):
        return v.value
    return str(v)


# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Provider Schemas
class ProviderCreate(BaseModel):
    name: str
    contact_info: Optional[str] = None
    rating: Optional[float] = None
    logo_url: Optional[str] = None


class ProviderOut(BaseModel):
    provider_id: int
    name: str
    contact_info: Optional[str] = None
    rating: Optional[float] = None
    logo_url: Optional[str] = None

    class Config:
        orm_mode = True


# Insurance Type Schemas
class InsuranceTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_type_id: Optional[int] = None


class InsuranceTypeOut(BaseModel):
    type_id: int
    name: str
    description: Optional[str] = None
    parent_type_id: Optional[int] = None

    class Config:
        orm_mode = True


# Insurance Policy Schemas
class InsurancePolicyCreate(BaseModel):
    type_id: int
    provider_id: int
    name: str
    description: Optional[str] = None
    coverage_summary: Optional[str] = None
    exclusions_summary: Optional[str] = None
    premium: Optional[float] = None
    duration: Optional[str] = None
    status: str = "active"
    contract_pdf_url: Optional[str] = None


class InsurancePolicyOut(BaseModel):
    policy_id: int
    type_id: int
    provider_id: int
    name: str
    description: Optional[str] = None
    coverage_summary: Optional[str] = None
    exclusions_summary: Optional[str] = None
    premium: Optional[float] = None
    duration: Optional[str] = None
    status: str
    contract_pdf_url: Optional[str] = None

    @validator('status', pre=True)
    def convert_status_to_str(cls, v):
        return enum_to_str(v)

    class Config:
        orm_mode = True


class InsurancePolicyDetailOut(InsurancePolicyOut):
    insurance_type: InsuranceTypeOut
    provider: ProviderOut

    class Config:
        orm_mode = True


# Required Document Schemas
class RequiredDocumentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    file_type: Optional[str] = None
    upload_instructions: Optional[str] = None


class RequiredDocumentOut(BaseModel):
    doc_id: int
    name: str
    description: Optional[str] = None
    file_type: Optional[str] = None
    upload_instructions: Optional[str] = None

    class Config:
        orm_mode = True


# Policy Document Requirement Schemas
class PolicyDocumentRequirementCreate(BaseModel):
    policy_id: int
    doc_id: int
    requirement_level: str
    notes: Optional[str] = None


class PolicyDocumentRequirementOut(BaseModel):
    policy_doc_id: int
    policy_id: int
    doc_id: int
    requirement_level: str
    notes: Optional[str] = None

    class Config:
        orm_mode = True


# User Document Schemas
class UserDocumentCreate(BaseModel):
    user_id: int
    doc_id: int
    file_url: str


class UserDocumentOut(BaseModel):
    user_doc_id: int
    user_id: int
    doc_id: int
    file_url: str
    verified: bool
    uploaded_at: datetime

    class Config:
        orm_mode = True


# Policy Document Version Schemas
class PolicyDocumentVersionCreate(BaseModel):
    policy_id: int
    version_number: Optional[str] = None
    pdf_url: Optional[str] = None
    effective_date: Optional[date] = None
    expires_date: Optional[date] = None
    notes: Optional[str] = None


class PolicyDocumentVersionOut(BaseModel):
    version_id: int
    policy_id: int
    version_number: Optional[str] = None
    pdf_url: Optional[str] = None
    effective_date: Optional[date] = None
    expires_date: Optional[date] = None
    notes: Optional[str] = None

    class Config:
        orm_mode = True


# User Policy Schemas
class UserPolicyCreate(BaseModel):
    user_id: int
    policy_id: int
    version_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    policy_number: Optional[str] = None
    premium_paid: Optional[float] = None
    status: str = "pending_payment"
    signed_contract_url: Optional[str] = None


class UserPolicyOut(BaseModel):
    user_policy_id: int
    user_id: int
    policy_id: int
    version_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    policy_number: Optional[str] = None
    premium_paid: Optional[float] = None
    status: str
    signed_contract_url: Optional[str] = None
    issued_at: datetime

    @validator('status', pre=True)
    def convert_status_to_str(cls, v):
        return enum_to_str(v)

    class Config:
        orm_mode = True


class UserPolicyDetailOut(UserPolicyOut):
    policy: InsurancePolicyDetailOut
    version: Optional[PolicyDocumentVersionOut] = None

    class Config:
        orm_mode = True


# Claim Schemas
class ClaimCreate(BaseModel):
    user_policy_id: int
    claim_amount: Optional[float] = None
    description: Optional[str] = None


class ClaimOut(BaseModel):
    claim_id: int
    user_policy_id: int
    date_filed: date
    claim_amount: Optional[float] = None
    status: str
    description: Optional[str] = None

    @validator('status', pre=True)
    def convert_status_to_str(cls, v):
        return enum_to_str(v)

    class Config:
        orm_mode = True


class ClaimDetailOut(ClaimOut):
    user_policy: UserPolicyOut

    class Config:
        orm_mode = True