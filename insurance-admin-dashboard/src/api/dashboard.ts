import api from "./axios";
import { DashboardStats } from "@/types";

/**
 * Dashboard analytics API endpoints
 * These will connect to /admin/dashboard/* endpoints on the FastAPI backend
 */

export interface DashboardStatsFilters {
  start_date?: string;
  end_date?: string;
}

export async function getDashboardStats(
  filters?: DashboardStatsFilters
): Promise<DashboardStats> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append("start_date", filters.start_date);
  if (filters?.end_date) params.append("end_date", filters.end_date);
  
  const queryString = params.toString();
  const url = `/admin/dashboard/stats${queryString ? `?${queryString}` : ""}`;
  const response = await api.get<DashboardStats>(url);
  return response.data;
}
