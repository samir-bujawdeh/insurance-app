import api from "./axios";

export async function listNotifications() {
  try {
    const res = await api.get("/notifications/");
    return res.data;
  } catch (error: any) {
    // Re-throw with more context for network errors
    if (!error.response && error.request) {
      const networkError = new Error("Network Error: Unable to reach backend server");
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).originalError = error;
      throw networkError;
    }
    throw error;
  }
}

export async function markNotificationRead(id: number) {
  try {
    const res = await api.post(`/notifications/read/${id}`);
    return res.data;
  } catch (error: any) {
    // Re-throw with more context for network errors
    if (!error.response && error.request) {
      const networkError = new Error("Network Error: Unable to reach backend server");
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).originalError = error;
      throw networkError;
    }
    throw error;
  }
}


