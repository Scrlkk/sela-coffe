import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Receipt,
  Truck,
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeStorage } from "@/utils/storage";
import {
  INITIAL_NOTIFICATIONS,
  type NotificationItem,
} from "@/mocks/fixtures";

export type { NotificationItem };

const STORAGE_KEY = "sela_mock_notifications";

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = safeStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <Receipt className="w-4 h-4 text-emerald-500" />;
      case "info":
        return <Truck className="w-4 h-4 text-primary" />;
      case "system":
      default:
        return <Clock className="w-4 h-4 text-sky-500" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10";
      case "success":
        return "bg-emerald-500/10";
      case "info":
        return "bg-primary/10";
      case "system":
      default:
        return "bg-sky-500/10";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className="group relative p-2 rounded-full text-foreground/80 hover:bg-secondary transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-extrabold text-white ring-2 ring-card group-hover:ring-secondary transition-all animate-in zoom-in shadow-xs">
              {unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 p-0 overflow-hidden rounded-2xl shadow-2xl border border-border/80 z-50"
      >
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 font-bold"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1 text-primary" />
                  Read all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
                title="Clear all notifications"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="max-h-84 overflow-y-auto divide-y divide-border/50 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2">
                <Inbox className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No notifications
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) {
                    const updated = notifications.map((n) =>
                      n.id === item.id ? { ...n, isRead: true } : n,
                    );
                    saveNotifications(updated);
                  }
                }}
                className={cn(
                  "flex items-start gap-3 p-3.5 transition-colors group hover:bg-muted/40 cursor-pointer select-none",
                  !item.isRead ? "bg-primary/5" : "bg-card",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl shrink-0 mt-0.5",
                    getIconBg(item.type),
                  )}
                >
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        "text-xs leading-snug truncate",
                        !item.isRead
                          ? "font-bold text-foreground"
                          : "font-medium text-foreground/80",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="h-6 w-6 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
