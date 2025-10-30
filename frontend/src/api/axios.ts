import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Prefer EXPO public env when available, fallback to local IP
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) ?? "http://192.168.3.2:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token if available
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync("access_token");
      console.log("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

export default api;
 