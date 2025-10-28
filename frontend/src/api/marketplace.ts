import api from "./axios";

// Types for the new API structure
export interface Provider {
  provider_id: number;
  name: string;
  contact_info?: string;
  rating?: number;
  logo_url?: string;
}

export interface InsuranceType {
  type_id: number;
  name: string;
  description?: string;
  parent_type_id?: number;
}

export interface InsurancePolicy {
  policy_id: number;
  type_id: number;
  provider_id: number;
  name: string;
  description?: string;
  coverage_summary?: string;
  exclusions_summary?: string;
  premium?: number;
  duration?: string;
  status: string;
  contract_pdf_url?: string;
}

export interface InsurancePolicyDetail extends InsurancePolicy {
  insurance_type: InsuranceType;
  provider: Provider;
}

// API functions
export async function getProviders(): Promise<Provider[]> {
  const res = await api.get("/marketplace/providers");
  return res.data;
}

export async function getInsuranceTypes(): Promise<InsuranceType[]> {
  const res = await api.get("/marketplace/insurance-types");
  return res.data;
}

export async function getPolicies(typeId?: number, providerId?: number): Promise<InsurancePolicy[]> {
  const params: any = {};
  if (typeId) params.type_id = typeId;
  if (providerId) params.provider_id = providerId;
  
  const res = await api.get("/marketplace/policies", { params });
  return res.data;
}

export async function getPolicy(policyId: number): Promise<InsurancePolicyDetail> {
  const res = await api.get(`/marketplace/policies/${policyId}`);
  return res.data;
}

export async function getPolicyRequirements(policyId: number) {
  const res = await api.get(`/marketplace/policies/${policyId}/requirements`);
  return res.data;
}

export async function getPolicyVersions(policyId: number) {
  const res = await api.get(`/marketplace/policies/${policyId}/versions`);
  return res.data;
}


