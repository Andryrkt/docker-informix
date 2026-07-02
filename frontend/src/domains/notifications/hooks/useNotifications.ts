import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/authContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/domains/notifications/api/notificationApi";

const QUERY_KEY = ["notifications"];

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const markRead = async (id: number) => {
    await markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const markAllRead = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount:   query.data?.unreadCount ?? 0,
    isLoading:     query.isLoading,
    markRead,
    markAllRead,
  };
}
