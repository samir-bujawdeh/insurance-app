import api from "./axios";
import * as SecureStore from "expo-secure-store";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);

  const response = await api.post<LoginResponse>("/auth/login", data);
  await SecureStore.setItemAsync("access_token", response.data.access_token);
  return response.data;
}

export async function getCurrentUser() {
  const token = await SecureStore.getItemAsync("access_token");
  if (!token) throw new Error("No token found");

  const response = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
