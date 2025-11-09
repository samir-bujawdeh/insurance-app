import api from "./axios";

/**
 * File upload API endpoints
 * These connect to the admin upload endpoints on the FastAPI backend
 */

export interface UploadResponse {
  message: string;
  records_processed: number;
  records_created: number;
  records_updated?: number;
  errors?: string[];
}

export type UploadType = "policies" | "tariffs" | "criteria";

export async function uploadPolicies(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post<UploadResponse>("/admin/upload/policies", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

export async function uploadTariffs(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post<UploadResponse>("/admin/upload/tariffs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

export async function uploadCriteria(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post<UploadResponse>("/admin/upload/criteria", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
}

// Legacy function for backward compatibility
export async function uploadRatesFile(file: File): Promise<UploadResponse> {
  return uploadPolicies(file);
}
