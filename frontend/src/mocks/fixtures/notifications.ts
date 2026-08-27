export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "warning" | "success" | "info" | "system";
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Low Stock Alert",
    message: "UD Susu Fresh Farm stock is low (remaining 3 units).",
    timestamp: "10 mins ago",
    isRead: false,
    type: "warning",
  },
  {
    id: "notif-2",
    title: "New Transaction",
    message: "Order #TXN-4892 completed successfully (Rp 64.000).",
    timestamp: "25 mins ago",
    isRead: false,
    type: "success",
  },
  {
    id: "notif-3",
    title: "Supplier Updated",
    message: "PT Sangkar Kopi Utama updated product catalog.",
    timestamp: "2 hours ago",
    isRead: true,
    type: "info",
  },
  {
    id: "notif-4",
    title: "Register Session Opened",
    message: "Morning register opened with initial cash Rp 200.000.",
    timestamp: "5 hours ago",
    isRead: true,
    type: "system",
  },
];
