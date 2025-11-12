from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Text, Boolean, Numeric, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from datetime import datetime
from .database import Base
import enum


# Enums
class PolicyStatus(enum.Enum):
    active = "active"
    inactive = "inactive"


class RequirementLevel(enum.Enum):
    mandatory_for_quote = "mandatory_for_quote"
    required_by_some = "required_by_some"
    mandatory_for_underwriting = "mandatory_for_underwriting"
    optional_boost = "optional_boost"


class UserPolicyStatus(enum.Enum):
    
    active = "active"
    expired = "expired"
    pending_payment = "pending_payment"


class ClaimStatus(enum.Enum):
    submitted = "submitted"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"


# Models
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    documents = relationship("UserDocument", back_populates="user")
    user_policies = relationship("UserPolicy", back_populates="user")


class Provider(Base):
    __tablename__ = "providers"

    provider_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    contact_info = Column(Text, nullable=True)
    rating = Column(Numeric(3, 2), nullable=True)
    logo_url = Column(String(255), nullable=True)

    # Relationships
    plans = relationship("InsurancePlan", back_populates="provider")


class InsuranceType(Base):
    __tablename__ = "insurance_types"

    type_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    parent_type_id = Column(Integer, ForeignKey("insurance_types.type_id"), nullable=True)

    # Self-referential relationship for hierarchical types
    parent_type = relationship("InsuranceType", remote_side=[type_id], backref="sub_types")
    
    # Relationships
    plans = relationship("InsurancePlan", back_populates="insurance_type")


class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    policy_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type_id = Column(Integer, ForeignKey("insurance_types.type_id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.provider_id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(50), nullable=True)
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.active)
    contract_pdf_url = Column(String(255), nullable=True)

    # Relationships
    insurance_type = relationship("InsuranceType", back_populates="plans")
    provider = relationship("Provider", back_populates="plans")
    document_requirements = relationship("PolicyDocumentRequirement", back_populates="plan")
    versions = relationship("PolicyDocumentVersion", back_populates="plan")
    user_policies = relationship("UserPolicy", back_populates="plan")


class RequiredDocument(Base):
    __tablename__ = "required_documents"

    doc_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String(50), nullable=True)
    upload_instructions = Column(Text, nullable=True)

    # Relationships
    policy_requirements = relationship("PolicyDocumentRequirement", back_populates="document")
    user_documents = relationship("UserDocument", back_populates="document")


class PolicyDocumentRequirement(Base):
    __tablename__ = "policy_document_requirements"

    policy_doc_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    policy_id = Column(Integer, ForeignKey("insurance_plans.policy_id"), nullable=False)
    doc_id = Column(Integer, ForeignKey("required_documents.doc_id"), nullable=False)
    requirement_level = Column(SQLEnum(RequirementLevel), nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    plan = relationship("InsurancePlan", back_populates="document_requirements")
    document = relationship("RequiredDocument", back_populates="policy_requirements")


class UserDocument(Base):
    __tablename__ = "user_documents"

    user_doc_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    doc_id = Column(Integer, ForeignKey("required_documents.doc_id"), nullable=False)
    file_url = Column(String(255), nullable=False)
    verified = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="documents")
    document = relationship("RequiredDocument", back_populates="user_documents")


class PolicyDocumentVersion(Base):
    __tablename__ = "policy_document_versions"

    version_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    policy_id = Column(Integer, ForeignKey("insurance_plans.policy_id"), nullable=False)
    version_number = Column(String(50), nullable=True)
    pdf_url = Column(String(255), nullable=True)
    effective_date = Column(Date, nullable=True)
    expires_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    plan = relationship("InsurancePlan", back_populates="versions")
    user_policies = relationship("UserPolicy", back_populates="version")


class UserPolicy(Base):
    __tablename__ = "user_policies"

    user_policy_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("insurance_plans.policy_id"), nullable=False)
    version_id = Column(Integer, ForeignKey("policy_document_versions.version_id"), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    policy_number = Column(String(100), nullable=True)
    premium_paid = Column(Numeric(10, 2), nullable=True)
    status = Column(SQLEnum(UserPolicyStatus), default=UserPolicyStatus.pending_payment)
    signed_contract_url = Column(String(255), nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_policies")
    plan = relationship("InsurancePlan", back_populates="user_policies")
    version = relationship("PolicyDocumentVersion", back_populates="user_policies")
    claims = relationship("Claim", back_populates="user_policy")


class Claim(Base):
    __tablename__ = "claims"

    claim_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_policy_id = Column(Integer, ForeignKey("user_policies.user_policy_id"), nullable=False)
    date_filed = Column(Date, default=datetime.utcnow().date())
    claim_amount = Column(Numeric(10, 2), nullable=True)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.submitted)
    description = Column(Text, nullable=True)

    # Relationships
    user_policy = relationship("UserPolicy", back_populates="claims")

class Tariff(Base):
    __tablename__ = "tariffs"

    tariff_id = Column(Integer, primary_key=True, autoincrement=True)
    policy_id = Column(Integer, ForeignKey("insurance_plans.policy_id"), nullable=False)

    age_min = Column(Integer, nullable=False)
    age_max = Column(Integer, nullable=False)
    class_type = Column(String(10), nullable=False)

    # Family details
    family_type = Column(String(30), nullable=True)  # Display label
    family_min = Column(Integer, nullable=False, default=1)
    family_max = Column(Integer, nullable=False, default=1)

    # Pricing
    inpatient_usd = Column(Numeric(10, 2), nullable=True)
    total_usd = Column(Numeric(10, 2), nullable=True)

    # Outpatient coverage
    outpatient_coverage_percentage = Column(Float, nullable=True)  # e.g. 0.0, 0.85, 1.0 for 0%, 85%, 100%
    outpatient_price_usd = Column(Numeric(10, 2), nullable=True)  # Additional price for this outpatient option

    plan = relationship("InsurancePlan", backref="tariffs")


class PlanCriteria(Base):
    __tablename__ = "plan_criteria"

    criteria_id = Column(Integer, primary_key=True, autoincrement=True)
    policy_id = Column(Integer, ForeignKey("insurance_plans.policy_id"), nullable=False)
    criteria_data = Column(JSONB, nullable=False, default={})  # In-patient criteria only
    outpatient_criteria_data = Column(JSONB, nullable=False, default={})  # Out-patient criteria

    # Relationship
    plan = relationship("InsurancePlan", backref="criteria")
