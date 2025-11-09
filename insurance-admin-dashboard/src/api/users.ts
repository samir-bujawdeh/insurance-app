import api from "./axios";
import { User, PaginatedResponse } from "@/types";

/**
 * Users management API endpoints
 * These will connect to /admin/users/* endpoints on the FastAPI backend
 */

export interface UserFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  const response = await api.get<PaginatedResponse<User>>("/admin/users", { params: filters });
  return response.data;
}

export async function getUserById(userId: number): Promise<User> {
  const response = await api.get<User>(`/admin/users/${userId}`);
  return response.data;
}

export async function updateUser(userId: number, data: Partial<User>): Promise<User> {
  const response = await api.patch<User>(`/admin/users/${userId}`, data);
  return response.data;
}

export async function deactivateUser(userId: number): Promise<User> {
  const response = await api.post<User>(`/admin/users/${userId}/deactivate`);
  return response.data;
}

export async function activateUser(userId: number): Promise<User> {
  const response = await api.post<User>(`/admin/users/${userId}/activate`);
  return response.data;
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

// User Policies
export async function getUserPolicies(userId: number): Promise<any[]> {
  const response = await api.get(`/admin/users/${userId}/policies`);
  return response.data;
}

export async function createUserPolicy(userId: number, data: any): Promise<any> {
  const response = await api.post(`/admin/users/${userId}/policies`, { ...data, user_id: userId });
  return response.data;
}

export async function deleteUserPolicy(userId: number, userPolicyId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}/policies/${userPolicyId}`);
}

// User Claims
export async function getUserClaims(userId: number): Promise<any[]> {
  const response = await api.get(`/admin/users/${userId}/claims`);
  return response.data;
}