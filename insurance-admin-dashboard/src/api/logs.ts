import api from "./axios";
import { AdminLog, PaginatedResponse } from "@/types";

/**
 * Admin logs API endpoints
 * These will connect to /admin/logs/* endpoints on the FastAPI backend
 */

export interface LogFilters {
  page?: number;
  page_size?: number;
  admin_user_id?: number;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}

export async function getAdminLogs(filters?: LogFilters): Promise<PaginatedResponse<AdminLog>> {
  const response = await api.get<PaginatedResponse<AdminLog>>("/admin/logs", { params: filters });
  return response.data;
}
