import axiosInstance from "@/conf/axios";

export interface NotificationItem {
  id: number;
  source: "NAVIGATION" | "OPERATION";
  title: string;
  message: string | null;
  pageUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  unreadCount: number;
  notifications: NotificationItem[];
}

export async function fetchNotifications(): Promise<NotificationListResponse> {
  const { data } = await axiosInstance.get("/notifications");
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await axiosInstance.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosInstance.post("/notifications/read-all");
}
