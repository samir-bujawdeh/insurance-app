import api from "./axios";

export interface UserPolicy {
  user_policy_id: number;
  user_id: number;
  policy_id: number;
  version_id?: number;
  start_date?: string;
  end_date?: string;
  policy_number?: string;
  premium_paid?: number;
  status: string;
  signed_contract_url?: string;
  issued_at: string;
}

export interface UserPolicyDetail extends UserPolicy {
  policy: {
    policy_id: number;
    type_id: number;
    provider_id: number;
    name: string;
    description?: string;
    coverage_summary?: string;
    exclusions_summary?: string;
    premium?: number;
    duration?: string;
    status: string;
    contract_pdf_url?: string;
    insurance_type: {
      type_id: number;
      name: string;
      description?: string;
      parent_type_id?: number;
    };
    provider: {
      provider_id: number;
      name: string;
      contact_info?: string;
      rating?: number;
      logo_url?: string;
    };
  };
  version?: {
    version_id: number;
    policy_id: number;
    version_number?: string;
    pdf_url?: string;
    effective_date?: string;
    expires_date?: string;
    notes?: string;
  };
}

export async function getMyPolicies(userId: number): Promise<UserPolicyDetail[]> {
  const res = await api.get(`/policies/mine?user_id=${userId}`);
  return res.data;
}

export async function purchasePolicy(userId: number, policyId: number, versionId?: number): Promise<UserPolicy> {
  const res = await api.post("/policies/purchase", {
    user_id: userId,
    policy_id: policyId,
    version_id: versionId
  });
  return res.data;
}

export async function activatePolicy(
  userPolicyId: number, 
  startDate: string, 
  endDate: string, 
  policyNumber: string, 
  premiumPaid: number
): Promise<UserPolicy> {
  const res = await api.put(`/policies/${userPolicyId}/activate`, {
    start_date: startDate,
    end_date: endDate,
    policy_number: policyNumber,
    premium_paid: premiumPaid
  });
  return res.data;
}

export async function getUserPolicy(userPolicyId: number): Promise<UserPolicyDetail> {
  const res = await api.get(`/policies/${userPolicyId}`);
  return res.data;
}


