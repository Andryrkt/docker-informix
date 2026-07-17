import { useState } from "react";
import { Bell, BellOff, CheckCheck, ChevronRight, History, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNotifications } from "@/domains/notifications/hooks/useNotifications";
import type { NotificationItem } from "@/domains/notifications/api/notificationApi";

function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ < 7) return `il y a ${diffJ} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

const SOURCE_CONFIG: Record<NotificationItem["source"], { icon: typeof MapPin; label: string; className: string }> = {
  NAVIGATION: { icon: MapPin, label: "Navigation", className: "bg-blue-50 text-blue-600" },
  OPERATION:  { icon: Zap,    label: "Opération",  className: "bg-purple-50 text-purple-600" },
};

/** Seules les pages de l'appli (SPA) sont navigables — pas les chemins d'API
 *  capturés côté backend (ex: /api/notifications) ni une URL absente. */
function isNavigablePage(pageUrl: string | null): pageUrl is string {
  return !!pageUrl && !pageUrl.startsWith("/api");
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: NotificationItem;
  onOpen: (n: NotificationItem) => void;
}) {
  const cfg = SOURCE_CONFIG[notification.source] ?? SOURCE_CONFIG.NAVIGATION;
  const Icon = cfg.icon;
  const navigable = isNavigablePage(notification.pageUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-gray-50 ${
        notification.isRead ? "" : "bg-red-50/40"
      }`}
    >
      <span className={`mt-0.5 flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${cfg.className}`}>
        <Icon size={13} />
      </span>

      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-center gap-1.5">
          {!notification.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
          )}
          <span className={`text-sm truncate ${notification.isRead ? "font-normal text-gray-600" : "font-semibold text-gray-800"}`}>
            {notification.title}
          </span>
        </span>
        {notification.message && (
          <p className="text-xs text-gray-500 line-clamp-2 whitespace-normal">
            {notification.message}
          </p>
        )}
        <span className="text-[0.65rem] text-gray-400">{timeAgo(notification.createdAt)}</span>
      </span>

      {navigable && <ChevronRight size={14} className="text-gray-300 shrink-0 mt-1.5" />}
    </button>
  );
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const handleOpen = (n: NotificationItem) => {
    if (!n.isRead) markRead(n.id);
    if (isNavigablePage(n.pageUrl)) {
      navigate(n.pageUrl);
    } else {
      setSelected(n);
    }
  };

  const selectedCfg = selected ? SOURCE_CONFIG[selected.source] ?? SOURCE_CONFIG.NAVIGATION : null;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200 hover:text-blue-500 focus:text-blue-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[0.6rem] font-semibold ring-2 ring-brand-dark">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 mt-2 bg-white text-gray-800 p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-3.5 py-3 border-b bg-gray-50/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[0.65rem] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <CheckCheck size={13} />
              Tout marquer lu
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-300 py-10">
              <BellOff size={22} />
              <span className="text-xs text-gray-400">Aucune notification</span>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onOpen={handleOpen} />
            ))
          )}
        </div>

        <a
          href="/admin/historique/navigation"
          onClick={(e) => { e.preventDefault(); navigate("/admin/historique/navigation"); }}
          className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t px-3 py-2.5 font-medium"
        >
          <History size={13} />
          Voir l'historique complet
        </a>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedCfg && (
              <span className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${selectedCfg.className}`}>
                <selectedCfg.icon size={12} />
              </span>
            )}
            {selected?.title}
          </DialogTitle>
          <DialogDescription>
            {selected && `${selectedCfg?.label ?? ""} · ${timeAgo(selected.createdAt)}`}
          </DialogDescription>
        </DialogHeader>
        <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
          {selected?.message ?? "Aucun détail disponible."}
        </p>
      </DialogContent>
    </Dialog>
    </>
  );
}
