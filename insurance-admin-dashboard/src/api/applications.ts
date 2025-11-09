import api from "./axios";
import { PaginatedResponse, UserPolicy, User } from "@/types";

export interface Application extends UserPolicy {
  user: User;
}

export interface ApplicationFilters {
  page?: number;
  page_size?: number;
  status?: string;
  policy_type_id?: number;
  provider_id?: number;
  search?: string;
}

export interface ApplicationDetail extends Application {
  user_documents: any[];
  required_documents: any[];
}

export interface ApproveApplicationData {
  start_date: string;
  end_date: string;
  policy_number: string;
  premium_paid: number;
}

export interface RejectApplicationData {
  reason?: string;
}

export async function getApplications(
  filters?: ApplicationFilters
): Promise<PaginatedResponse<Application>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.page_size) params.append("page_size", filters.page_size.toString());
  if (filters?.status) params.append("status", filters.status);
  if (filters?.policy_type_id) params.append("policy_type_id", filters.policy_type_id.toString());
  if (filters?.provider_id) params.append("provider_id", filters.provider_id.toString());
  if (filters?.search) params.append("search", filters.search);

  const res = await api.get(`/admin/applications?${params.toString()}`);
  return res.data;
}

export async function getApplicationById(
  userPolicyId: number
): Promise<ApplicationDetail> {
  const res = await api.get(`/admin/applications/${userPolicyId}`);
  return res.data;
}

export async function approveApplication(
  userPolicyId: number,
  data: ApproveApplicationData
): Promise<UserPolicy> {
  const res = await api.post(`/admin/applications/${userPolicyId}/approve`, data);
  return res.data;
}

export async function rejectApplication(
  userPolicyId: number,
  data: RejectApplicationData
): Promise<UserPolicy> {
  const res = await api.post(`/admin/applications/${userPolicyId}/reject`, data);
  return res.data;
}

