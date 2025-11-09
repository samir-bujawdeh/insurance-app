import api from "./axios";
import { Provider, PaginatedResponse } from "@/types";

/**
 * Providers management API endpoints
 * These will connect to /admin/providers/* endpoints on the FastAPI backend
 */

export interface ProviderCreate {
  name: string;
  contact_info?: string;
  rating?: number;
  logo_url?: string;
}

export async function getProviders(): Promise<Provider[]> {
  const response = await api.get<Provider[]>("/admin/providers");
  return response.data;
}

export async function getProviderById(providerId: number): Promise<Provider> {
  const response = await api.get<Provider>(`/admin/providers/${providerId}`);
  return response.data;
}

export async function createProvider(data: ProviderCreate): Promise<Provider> {
  const response = await api.post<Provider>("/admin/providers", data);
  return response.data;
}

export async function updateProvider(providerId: number, data: Partial<ProviderCreate>): Promise<Provider> {
  const response = await api.patch<Provider>(`/admin/providers/${providerId}`, data);
  return response.data;
}

export async function deleteProvider(providerId: number): Promise<void> {
  await api.delete(`/admin/providers/${providerId}`);
}
