import api from "./axios";

export async function listNotifications() {
  const res = await api.get("/notifications/");
  return res.data;
}

export async function markNotificationRead(id: number) {
  const res = await api.post(`/notifications/read/${id}`);
  return res.data;
}


