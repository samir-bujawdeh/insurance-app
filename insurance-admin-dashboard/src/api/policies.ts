import api from "./axios";
import { InsurancePlan, PaginatedResponse } from "@/types";

/**
 * Policies management API endpoints
 * These will connect to /admin/policies/* endpoints on the FastAPI backend
 */

export interface PolicyFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: "active" | "inactive";
  type_id?: number;
  provider_id?: number;
}

export interface PolicyCreate {
  type_id: number;
  provider_id: number;
  name: string;
  description?: string;
  duration?: string;
  status?: "active" | "inactive";
  contract_pdf_url?: string;
}

export async function getPolicies(filters?: PolicyFilters): Promise<PaginatedResponse<InsurancePlan>> {
  const response = await api.get<PaginatedResponse<InsurancePlan>>("/admin/policies", { params: filters });
  return response.data;
}

export async function getPolicyById(policyId: number): Promise<InsurancePlan> {
  const response = await api.get<InsurancePlan>(`/admin/policies/${policyId}`);
  return response.data;
}

export async function createPolicy(data: PolicyCreate): Promise<InsurancePlan> {
  const response = await api.post<InsurancePlan>("/admin/policies", data);
  return response.data;
}

export async function updatePolicy(policyId: number, data: Partial<PolicyCreate>): Promise<InsurancePlan> {
  const response = await api.patch<InsurancePlan>(`/admin/policies/${policyId}`, data);
  return response.data;
}

export async function deletePolicy(policyId: number): Promise<void> {
  await api.delete(`/admin/policies/${policyId}`);
}
