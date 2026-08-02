import { TrendingUp, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import type { StatCardProps } from "@/components/dashboard/StatCard";
import { formatRupiah } from "@/utils/formatCurrency";

export const FILTER_OPTIONS = [
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
] as const;

export type FilterPeriod = (typeof FILTER_OPTIONS)[number];

export interface RevenuePoint {
  day: string;
  revenue: number;
}

export interface CategorySale {
  category: string;
  percentage: number;
  color: string;
}

export interface TransactionItem {
  id: string;
  code: string;
  time: string;
  itemsCount: number;
  amount: number;
  formattedAmount: string;
  status: "completed" | "refunded" | "pending";
}

export interface ActivityItem {
  id: string;
  message: string;
  timeAgo: string;
  accentColor: string;
}

export const STAT_CARDS: StatCardProps[] = [
  {
    title: "Total Revenue",
    value: formatRupiah(35000000),
    badgeText: "↗ +12.4%",
    badgeVariant: "success",
    icon: TrendingUp,
  },
  {
    title: "Today's Sales",
    value: formatRupiah(2500000),
    badgeText: "↗ +8.2%",
    badgeVariant: "success",
    icon: ShoppingCart,
  },
  {
    title: "Total Products",
    value: "142",
    badgeText: "↗ 3 New",
    badgeVariant: "success",
    icon: Package,
  },
  {
    title: "Low Stock Items",
    value: "7",
    badgeText: "↘ Restock Soon",
    badgeVariant: "danger",
    icon: AlertTriangle,
  },
];

export const REVENUE_OVERVIEW_DATA: RevenuePoint[] = [
  { day: "Mon", revenue: 12000000 },
  { day: "Tue", revenue: 18900000 },
  { day: "Wed", revenue: 16500000 },
  { day: "Thu", revenue: 21000000 },
  { day: "Fri", revenue: 27500000 },
  { day: "Sat", revenue: 32800000 },
  { day: "Sun", revenue: 24500000 },
];

export const SALES_BY_CATEGORY_DATA: CategorySale[] = [
  { category: "Beverages", percentage: 38, color: "#6b2f0a" },
  { category: "Food", percentage: 29, color: "#647a38" },
  { category: "Snacks", percentage: 18, color: "#c68a4c" },
  { category: "Retail", percentage: 15, color: "#b44a3a" },
];

export const TODAY_TRANSACTIONS_DATA: TransactionItem[] = [
  {
    id: "1",
    code: "TXN-2847",
    time: "09:42 AM",
    itemsCount: 4,
    amount: 245000,
    formattedAmount: formatRupiah(245000),
    status: "completed",
  },
  {
    id: "2",
    code: "TXN-2846",
    time: "09:18 AM",
    itemsCount: 2,
    amount: 90000,
    formattedAmount: formatRupiah(90000),
    status: "completed",
  },
  {
    id: "3",
    code: "TXN-2845",
    time: "08:55 AM",
    itemsCount: 6,
    amount: 378000,
    formattedAmount: formatRupiah(378000),
    status: "completed",
  },
  {
    id: "4",
    code: "TXN-2844",
    time: "08:31 AM",
    itemsCount: 1,
    amount: 55000,
    formattedAmount: formatRupiah(55000),
    status: "completed",
  },
  {
    id: "5",
    code: "TXN-2843",
    time: "08:12 AM",
    itemsCount: 3,
    amount: 180000,
    formattedAmount: formatRupiah(180000),
    status: "refunded",
  },
  {
    id: "6",
    code: "TXN-2842",
    time: "07:50 AM",
    itemsCount: 2,
    amount: 120000,
    formattedAmount: formatRupiah(120000),
    status: "completed",
  },
];

export const RECENT_ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: "1",
    message: "Low stock alert: Matcha Latte Powder (6 remaining)",
    timeAgo: "5 min ago",
    accentColor: "#c68a4c",
  },
  {
    id: "2",
    message: "Purchase order PO-0142 received from Green Fields Co.",
    timeAgo: "32 min ago",
    accentColor: "#647a38",
  },
  {
    id: "3",
    message: "New user Sara Mitchell added to system",
    timeAgo: "1 hr ago",
    accentColor: "#a88d75",
  },
  {
    id: "4",
    message: `Refund processed for TXN-2843 — ${formatRupiah(180000)}`,
    timeAgo: "2 hr ago",
    accentColor: "#b44a3a",
  },
  {
    id: "5",
    message: "Stock adjustment for Almond Croissant updated",
    timeAgo: "3 hr ago",
    accentColor: "#a88d75",
  },
  {
    id: "6",
    message: "Daily sales report generated for yesterday",
    timeAgo: "5 hr ago",
    accentColor: "#647a38",
  },
];
