import api from "./axios";
import { AdminUser, User } from "@/types";

/**
 * Admin authentication API endpoints
 * These will connect to /admin/auth/* endpoints on the FastAPI backend
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AdminUser;
}

export async function adminLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/admin/auth/login", credentials);
  return response.data;
}

export async function getAdminProfile(): Promise<AdminUser> {
  const response = await api.get<AdminUser>("/admin/auth/me");
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/admin/auth/logout");
}
