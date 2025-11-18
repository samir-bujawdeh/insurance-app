import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Prefer EXPO public env when available, fallback to local IP
// NOTE: Update the IP address below to match your machine's local IP address
// On Windows: Run `ipconfig` and look for IPv4 Address under your active network adapter
// On Mac/Linux: Run `ifconfig` or `ip addr` and look for your local IP
// For Android emulator, use: http://10.0.2.2:8000
// For iOS simulator, use: http://localhost:8000
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) ?? "http://192.168.3.3:8000";

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
 