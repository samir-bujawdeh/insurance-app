import api from "./axios";

/**
 * Plan Criteria management API endpoints
 * These connect to /admin/policies/{policy_id}/criteria endpoints
 */

export interface CoverageItem {
  notes?: string;
}

export interface InPatientGeneralCoverages {
  annual_limit: CoverageItem;
  scope_of_coverage: CoverageItem;
  network: CoverageItem;
  geographic_coverage_elective: CoverageItem;
  geographic_coverage_emergency: CoverageItem;
  waiting_period: CoverageItem;
  non_direct_billing: CoverageItem;
  cold_case: CoverageItem;
  hospital_accommodation: CoverageItem;
  road_ambulance: CoverageItem;
  maternity_in_patient: CoverageItem;
  maternity_lab_test: CoverageItem;
  new_born: CoverageItem;
  nursery_incubator: CoverageItem;
  extra_bed_parent: CoverageItem;
  home_care: CoverageItem;
  plan_upgrade_downgrade: CoverageItem;
  passive_war: CoverageItem;
  payment_frequency: CoverageItem;
  pre_existing_conditions: CoverageItem;
}

export interface InPatientCaseCoverages {
  physiotherapy: CoverageItem;
  work_related_injuries: CoverageItem;
  acute_allergy_treatments: CoverageItem;
  bariatric_surgeries: CoverageItem;
  breast_reconstruction: CoverageItem;
  chemotherapy_radiotherapy: CoverageItem;
  chronic_conditions: CoverageItem;
  congenital_cases_lifetime: CoverageItem;
  congenital_tests_thalassemia: CoverageItem;
  epidural: CoverageItem;
  epilepsy: CoverageItem;
  icu: CoverageItem;
  infertility_impotence_sterility: CoverageItem;
  laparoscopic_procedures: CoverageItem;
  migraines: CoverageItem;
  motorcycling: CoverageItem;
  organ_transplant: CoverageItem;
  polysomnography: CoverageItem;
  prosthesis_due_to_accident: CoverageItem;
  prosthesis_due_to_sickness: CoverageItem;
  rehabilitation: CoverageItem;
  renal_dialysis: CoverageItem;
  scoliosis: CoverageItem;
  std_excluding_hiv: CoverageItem;
  varicocele: CoverageItem;
  varicose_veins: CoverageItem;
  morgue_burial_expenses: CoverageItem;
  genetic_tests: CoverageItem;
  diagnostic_tests: CoverageItem;
  ambulatory_laboratory_exams: CoverageItem;
  doctor_visits_consultations: CoverageItem;
  prescribed_medicines_drugs: CoverageItem;
}

export interface InPatientCoverage {
  general_coverages: InPatientGeneralCoverages;
  case_coverages: InPatientCaseCoverages;
}

export interface OutPatientCoverage {
  outpatient_annual_limit: CoverageItem;
  outpatient_coverage: CoverageItem;
  outpatient_network: CoverageItem;
  outpatient_deductible: CoverageItem;
  diagnostic_tests: CoverageItem;
  ambulatory_laboratory_exams: CoverageItem;
  doctor_visits_consultations: CoverageItem;
  prescribed_medicines_drugs: CoverageItem;
}

export interface InPatientCriteriaData {
  in_patient: InPatientCoverage;
}

export interface OutPatientCriteriaData {
  out_patient: OutPatientCoverage;
}

export interface PlanCriteria {
  criteria_id: number;
  policy_id: number;
  criteria_data: InPatientCriteriaData;
  outpatient_criteria_data: OutPatientCriteriaData;
}

export interface PlanCriteriaUpdate {
  criteria_data: InPatientCriteriaData;
  outpatient_criteria_data: OutPatientCriteriaData;
}

export async function getCriteriaByPolicy(policyId: number): Promise<PlanCriteria> {
  const response = await api.get<PlanCriteria>(`/admin/policies/${policyId}/criteria`);
  return response.data;
}

export async function createOrUpdateCriteria(policyId: number, data: PlanCriteriaUpdate): Promise<PlanCriteria> {
  const response = await api.post<PlanCriteria>(`/admin/policies/${policyId}/criteria`, data);
  return response.data;
}

export async function deleteCriteria(policyId: number): Promise<void> {
  await api.delete(`/admin/policies/${policyId}/criteria`);
}

