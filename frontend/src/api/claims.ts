import api from "./axios";

export interface Claim {
  claim_id: number;
  user_policy_id: number;
  date_filed: string;
  claim_amount?: number;
  status: string;
  description?: string;
}

export interface ClaimDetail extends Claim {
  user_policy: {
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
  };
}

export async function listClaims(): Promise<Claim[]> {
  const res = await api.get("/claims/");
  return res.data;
}

export async function createClaim(userPolicyId: number, claimAmount?: number, description?: string): Promise<Claim> {
  const res = await api.post("/claims/", { 
    user_policy_id: userPolicyId,
    claim_amount: claimAmount,
    description: description
  });
  return res.data;
}


