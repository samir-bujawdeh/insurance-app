// User Types
export interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface AdminUser {
  user_id: number;
  email: string;
  name: string;
  is_admin: boolean;
}

// Plan Types
export interface InsurancePlan {
  policy_id: number;
  type_id: number;
  provider_id: number;
  name: string;
  description?: string;
  duration?: string;
  status: "active" | "inactive";
  contract_pdf_url?: string;
  insurance_type?: InsuranceType;
  provider?: Provider;
}

export interface InsuranceType {
  type_id: number;
  name: string;
  description?: string;
  parent_type_id?: number;
}

// Provider Types
export interface Provider {
  provider_id: number;
  name: string;
  contact_info?: string;
  rating?: number;
  logo_url?: string;
}

// Claim Types
export interface Claim {
  claim_id: number;
  user_policy_id: number;
  date_filed: string;
  claim_amount?: number;
  status: "submitted" | "in_review" | "approved" | "rejected";
  description?: string;
  user_policy?: UserPolicy;
}

// User Policy Types
export interface UserPolicy {
  user_policy_id: number;
  user_id: number;
  policy_id: number;
  version_id?: number;
  start_date?: string;
  end_date?: string;
  policy_number?: string;
  premium_paid?: number;
  status: "active" | "expired" | "pending_payment";
  signed_contract_url?: string;
  issued_at: string;
  plan?: InsurancePlan;
  user?: User;
}

// Document Types
export interface UserDocument {
  user_doc_id: number;
  user_id: number;
  doc_id: number;
  file_url: string;
  verified: boolean;
  uploaded_at: string;
}

export interface RequiredDocument {
  doc_id: number;
  name: string;
  description?: string;
  file_type?: string;
  upload_instructions?: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_policies: number;
  active_policies: number;
  pending_applications: number;
  pending_claims: number;
  total_revenue: number;
  average_premium: number;
  users_growth?: number;
  policies_growth?: number;
  revenue_growth?: number;
  approval_rate?: number;
  claims_approved?: number;
  claims_rejected?: number;
  top_insurance_types?: Array<{ name: string; count: number }>;
  top_providers?: Array<{ name: string; count: number }>;
  revenue_trend?: Array<{ month: string; revenue: number }>;
  applications_trend?: Array<{ month: string; applications: number }>;
}

// Admin Log Types
export interface AdminLog {
  log_id: number;
  admin_user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details?: string;
  created_at: string;
  admin_user?: AdminUser;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
}
