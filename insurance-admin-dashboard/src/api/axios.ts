import axios from "axios";

/**
 * Base Axios instance for all API requests
 * Configured to use the backend API base URL from environment variables
 * 
 * For production: Set VITE_API_BASE_URL in your .env file
 * Example: VITE_API_BASE_URL=https://api.myapp.com
 * 
 * For local development: VITE_API_BASE_URL=http://localhost:8000
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.3.11:8000",
  // withCredentials removed - we use localStorage for tokens, not cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Get the API base URL for constructing full URLs (e.g., for static assets)
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || "http://192.168.3.11:8000";
};