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

export {
  type RevenuePoint,
  type CategorySale,
  type TransactionItem,
  type ActivityItem,
  REVENUE_OVERVIEW_DATA,
  SALES_BY_CATEGORY_DATA,
  TODAY_TRANSACTIONS_DATA,
  RECENT_ACTIVITIES_DATA,
} from "@/mocks/fixtures";
