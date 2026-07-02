import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/domains/notifications/hooks/useNotifications";
import type { NotificationItem } from "@/domains/notifications/api/notificationApi";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: NotificationItem;
  onRead: (id: number) => void;
}) {
  return (
    <DropdownMenuItem
      className={`flex flex-col items-start gap-0.5 whitespace-normal py-2 ${
        notification.isRead ? "opacity-60" : "bg-red-50/60"
      }`}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <span className="text-sm font-medium text-gray-800">{notification.title}</span>
      {notification.message && (
        <span className="text-xs text-gray-500 line-clamp-2">{notification.message}</span>
      )}
      <span className="text-[0.65rem] text-gray-400">{fmtDate(notification.createdAt)}</span>
    </DropdownMenuItem>
  );
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200 hover:text-blue-500 focus:text-blue-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[0.6rem] font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 mt-2 bg-white text-gray-800 max-h-96 overflow-y-auto"
      >
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:underline"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-6">
            Aucune notification
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} onRead={markRead} />
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/admin/historique/navigation"
            className="text-xs text-center w-full justify-center text-gray-500"
          >
            Voir l'historique complet
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
