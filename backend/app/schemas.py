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
    is_admin: Optional[bool] = False
    is_active: Optional[bool] = True
    created_at: datetime

    class Config:
        orm_mode = True


class AdminUserOut(BaseModel):
    user_id: int
    email: EmailStr
    name: str
    is_admin: bool

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
    duration: Optional[str] = None
    status: str = "active"
    contract_pdf_url: Optional[str] = None


class InsurancePolicyOut(BaseModel):
    policy_id: int
    type_id: int
    provider_id: int
    name: str
    description: Optional[str] = None
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


# Application Review Schemas
class ApplicationApproveRequest(BaseModel):
    start_date: date
    end_date: date
    policy_number: str
    premium_paid: float

class ApplicationRejectRequest(BaseModel):
    reason: Optional[str] = None

class ApplicationDetailOut(UserPolicyDetailOut):
    user: UserOut
    user_documents: List[UserDocumentOut] = []
    required_documents: List[RequiredDocumentOut] = []

    class Config:
        orm_mode = True


# Pagination Schema
class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    page_size: int
    total_pages: int


# Plan Criteria Schemas
class CoverageItemBase(BaseModel):
    coverage_type: str  # "limited" | "covered" | "conditional"
    coverage_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    waiting_period_days: Optional[int] = None
    notes: Optional[str] = ""


class InPatientGeneralCoverages(BaseModel):
    annual_limit: CoverageItemBase
    scope_of_coverage: CoverageItemBase
    network: CoverageItemBase
    geographic_coverage_elective: CoverageItemBase
    geographic_coverage_emergency: CoverageItemBase
    waiting_period: CoverageItemBase
    non_direct_billing: CoverageItemBase
    cold_case: CoverageItemBase
    hospital_accommodation: CoverageItemBase
    road_ambulance: CoverageItemBase
    maternity_in_patient: CoverageItemBase
    maternity_lab_test: CoverageItemBase
    new_born: CoverageItemBase
    nursery_incubator: CoverageItemBase
    extra_bed_parent: CoverageItemBase
    home_care: CoverageItemBase
    plan_upgrade_downgrade: CoverageItemBase
    passive_war: CoverageItemBase
    payment_frequency: CoverageItemBase
    pre_existing_conditions: CoverageItemBase


class InPatientCaseCoverages(BaseModel):
    physiotherapy: CoverageItemBase
    work_related_injuries: CoverageItemBase
    acute_allergy_treatments: CoverageItemBase
    bariatric_surgeries: CoverageItemBase
    breast_reconstruction: CoverageItemBase
    chemotherapy_radiotherapy: CoverageItemBase
    chronic_conditions: CoverageItemBase
    congenital_cases_lifetime: CoverageItemBase
    congenital_tests_thalassemia: CoverageItemBase
    epidural: CoverageItemBase
    epilepsy: CoverageItemBase
    icu: CoverageItemBase
    infertility_impotence_sterility: CoverageItemBase
    laparoscopic_procedures: CoverageItemBase
    migraines: CoverageItemBase
    motorcycling: CoverageItemBase
    organ_transplant: CoverageItemBase
    polysomnography: CoverageItemBase
    prosthesis_due_to_accident: CoverageItemBase
    prosthesis_due_to_sickness: CoverageItemBase
    rehabilitation: CoverageItemBase
    renal_dialysis: CoverageItemBase
    scoliosis: CoverageItemBase
    std_excluding_hiv: CoverageItemBase
    varicocele: CoverageItemBase
    varicose_veins: CoverageItemBase
    morgue_burial_expenses: CoverageItemBase
    genetic_tests: CoverageItemBase
    diagnostic_tests: CoverageItemBase
    ambulatory_laboratory_exams: CoverageItemBase
    doctor_visits_consultations: CoverageItemBase
    prescribed_medicines_drugs: CoverageItemBase


class InPatientCoverage(BaseModel):
    general_coverages: InPatientGeneralCoverages
    case_coverages: InPatientCaseCoverages


class OutPatientCoverage(BaseModel):
    outpatient_annual_limit: CoverageItemBase
    outpatient_coverage: CoverageItemBase
    outpatient_network: CoverageItemBase
    outpatient_deductible: CoverageItemBase
    diagnostic_tests: CoverageItemBase
    ambulatory_laboratory_exams: CoverageItemBase
    doctor_visits_consultations: CoverageItemBase
    prescribed_medicines_drugs: CoverageItemBase


class PlanCriteriaData(BaseModel):
    in_patient: InPatientCoverage
    out_patient: OutPatientCoverage


class PlanCriteriaCreate(BaseModel):
    policy_id: int
    criteria_data: PlanCriteriaData


class PlanCriteriaUpdate(BaseModel):
    criteria_data: PlanCriteriaData


class PlanCriteriaOut(BaseModel):
    criteria_id: int
    policy_id: int
    criteria_data: dict

    class Config:
        orm_mode = True


# Tariff Schemas
class TariffCreate(BaseModel):
    policy_id: int
    age_min: int
    age_max: int
    class_type: str  # e.g. A, B, SK
    family_type: Optional[str] = None  # Display label e.g. "Family (2–4)"
    family_min: int = 1
    family_max: int = 1
    inpatient_usd: Optional[float] = None
    total_usd: Optional[float] = None
    outpatient_coverage_percentage: Optional[float] = None  # e.g. 0.0, 0.85, 1.0 for 0%, 85%, 100%
    outpatient_price_usd: Optional[float] = None  # Additional price for this outpatient option


class TariffUpdate(BaseModel):
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    class_type: Optional[str] = None
    family_type: Optional[str] = None
    family_min: Optional[int] = None
    family_max: Optional[int] = None
    inpatient_usd: Optional[float] = None
    total_usd: Optional[float] = None
    outpatient_coverage_percentage: Optional[float] = None
    outpatient_price_usd: Optional[float] = None


class TariffOut(BaseModel):
    tariff_id: int
    policy_id: int
    age_min: int
    age_max: int
    class_type: str
    family_type: Optional[str] = None
    family_min: int
    family_max: int
    inpatient_usd: Optional[float] = None
    total_usd: Optional[float] = None
    outpatient_coverage_percentage: Optional[float] = None
    outpatient_price_usd: Optional[float] = None

    class Config:
        orm_mode = True


class TariffBulkCreate(BaseModel):
    tariffs: List[TariffCreate]


# Upload Response Schema
class UploadResponse(BaseModel):
    message: str
    records_processed: int
    records_created: int
    records_updated: int = 0
    errors: List[str] = []