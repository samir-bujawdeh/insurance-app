import api from "./axios";
import * as SecureStore from "expo-secure-store";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  user_id: number;
  email: string;
  name: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface SignupResponse {
  access_token: string;
  token_type: string;
  user: {
    user_id: number;
    email: string;
    name: string;
  };
}

export async function signupUser(userData: SignupData): Promise<SignupResponse> {
  const response = await api.post("/auth/signup", userData);
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  // Send form data specifically for login
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);

  const response = await api.post<LoginResponse>("/auth/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  await SecureStore.setItemAsync("access_token", response.data.access_token);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const token = await SecureStore.getItemAsync("access_token");
  if (!token) throw new Error("No token found");

  const response = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
