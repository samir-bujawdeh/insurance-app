import api from "./axios";

/**
 * Insurance Types management API endpoints
 */

export interface InsuranceType {
  type_id: number;
  name: string;
  description?: string;
  parent_type_id?: number;
}

export interface InsuranceTypeCreate {
  name: string;
  description?: string;
  parent_type_id?: number;
}

export async function getInsuranceTypes(): Promise<InsuranceType[]> {
  const response = await api.get<InsuranceType[]>("/marketplace/insurance-types");
  return response.data;
}

