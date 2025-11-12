import api from "./axios";

/**
 * Tariffs management API endpoints
 * These connect to /admin/policies/{policy_id}/tariffs and /admin/tariffs/* endpoints
 */

export interface Tariff {
  tariff_id: number;
  policy_id: number;
  age_min: number;
  age_max: number;
  class_type: string;
  family_type?: string;
  family_min: number;
  family_max: number;
  inpatient_usd?: number;
  total_usd?: number;
  outpatient_coverage_percentage?: number;  // e.g. 0.0, 0.85, 1.0 for 0%, 85%, 100%
  outpatient_price_usd?: number;  // Additional price for this outpatient option
}

export interface TariffCreate {
  policy_id: number;
  age_min: number;
  age_max: number;
  class_type: string;
  family_type?: string;
  family_min: number;
  family_max: number;
  inpatient_usd?: number;
  total_usd?: number;
  outpatient_coverage_percentage?: number;
  outpatient_price_usd?: number;
}

export async function getTariffsByPolicy(policyId: number): Promise<Tariff[]> {
  const response = await api.get<Tariff[]>(`/admin/policies/${policyId}/tariffs`);
  return response.data;
}

export async function createTariff(data: TariffCreate): Promise<Tariff> {
  const response = await api.post<Tariff[]>(`/admin/policies/${data.policy_id}/tariffs`, {
    tariffs: [data]
  });
  return response.data[0];
}

export async function deleteTariff(tariffId: number): Promise<void> {
  await api.delete(`/admin/tariffs/${tariffId}`);
}

export async function deleteAllTariffsForPolicy(policyId: number): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/admin/policies/${policyId}/tariffs`);
  return response.data;
}

