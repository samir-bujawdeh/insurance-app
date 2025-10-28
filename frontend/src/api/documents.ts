import api from "./axios";

export interface RequiredDocument {
  doc_id: number;
  name: string;
  description?: string;
  file_type?: string;
  upload_instructions?: string;
}

export interface UserDocument {
  user_doc_id: number;
  user_id: number;
  doc_id: number;
  file_url: string;
  verified: boolean;
  uploaded_at: string;
}

export interface PolicyDocumentRequirement {
  policy_doc_id: number;
  policy_id: number;
  doc_id: number;
  requirement_level: string;
  notes?: string;
}

export interface PolicyDocumentVersion {
  version_id: number;
  policy_id: number;
  version_number?: string;
  pdf_url?: string;
  effective_date?: string;
  expires_date?: string;
  notes?: string;
}

export async function getRequiredDocuments(): Promise<RequiredDocument[]> {
  const res = await api.get("/documents/required");
  return res.data;
}

export async function getUserDocuments(userId: number): Promise<UserDocument[]> {
  const res = await api.get(`/documents/user/${userId}`);
  return res.data;
}

export async function uploadDocument(userId: number, docId: number, fileUrl: string): Promise<UserDocument> {
  const res = await api.post("/documents/upload", {
    user_id: userId,
    doc_id: docId,
    file_url: fileUrl
  });
  return res.data;
}

export async function verifyDocument(userDocId: number, verified: boolean): Promise<UserDocument> {
  const res = await api.put(`/documents/${userDocId}/verify`, { verified });
  return res.data;
}

export async function getPolicyRequirements(policyId: number): Promise<PolicyDocumentRequirement[]> {
  const res = await api.get(`/documents/policy-requirements`, {
    params: { policy_id: policyId }
  });
  return res.data;
}
