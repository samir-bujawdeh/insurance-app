import api from "./axios";
import { Claim, PaginatedResponse } from "@/types";

/**
 * Claims management API endpoints
 * These will connect to /admin/claims/* endpoints on the FastAPI backend
 */

export interface ClaimFilters {
  page?: number;
  page_size?: number;
  status?: "submitted" | "in_review" | "approved" | "rejected";
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function getClaims(filters?: ClaimFilters): Promise<PaginatedResponse<Claim>> {
  const response = await api.get<PaginatedResponse<Claim>>("/admin/claims", { params: filters });
  return response.data;
}

export async function getClaimById(claimId: number): Promise<Claim> {
  const response = await api.get<Claim>(`/admin/claims/${claimId}`);
  return response.data;
}

export async function approveClaim(claimId: number): Promise<Claim> {
  const response = await api.post<Claim>(`/admin/claims/${claimId}/approve`);
  return response.data;
}

export async function rejectClaim(claimId: number, reason?: string): Promise<Claim> {
  const response = await api.post<Claim>(`/admin/claims/${claimId}/reject`, { reason });
  return response.data;
}

export async function updateClaimStatus(claimId: number, status: Claim["status"]): Promise<Claim> {
  const response = await api.patch<Claim>(`/admin/claims/${claimId}`, { status });
  return response.data;
}
