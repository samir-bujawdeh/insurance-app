import axios from "axios";

// ⚠️ Replace this with your PC’s local IP address from `ipconfig`
const BASE_URL = "http://192.168.3.2:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded", // because FastAPI login uses form-data
  },
});

export default api;
 