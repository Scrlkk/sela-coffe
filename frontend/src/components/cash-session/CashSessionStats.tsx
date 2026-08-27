import React from "react";
import { Store, Banknote, TrendingUp, ShoppingBag } from "lucide-react";
import { StatCard, type StatCardProps } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { formatRupiah } from "@/utils/formatCurrency";

interface CashSessionStatsProps {
  isOpen: boolean;
  openingFloat: number | null;
  cashSalesToday: number;
  totalOrdersToday?: number;
}

export const CashSessionStats: React.FC<CashSessionStatsProps> = ({
  isOpen,
  openingFloat,
  cashSalesToday,
  totalOrdersToday = 0,
}) => {
  const floatNum = openingFloat ?? 0;
  const salesPercentage =
    floatNum > 0 ? Math.round((cashSalesToday / floatNum) * 100) : 0;

  const statItems: StatCardProps[] = [
    {
      title: "Current Session",
      value: isOpen ? "Register Open" : "Register Closed",
      badgeText: isOpen ? "Active Shift" : "Closed",
      badgeVariant: isOpen ? "success" : "neutral",
      icon: Store,
    },
    {
      title: "Opening Float",
      value: isOpen && openingFloat !== null ? formatRupiah(openingFloat) : "—",
      badgeText: isOpen ? "Float Modal" : "No Shift",
      badgeVariant: isOpen ? "neutral" : "neutral",
      icon: Banknote,
    },
    {
      title: "Live Cash Sales",
      value: formatRupiah(cashSalesToday),
      badgeText:
        isOpen && cashSalesToday > 0
          ? `+${salesPercentage}% float`
          : isOpen
            ? "0% sales"
            : "Closed",
      badgeVariant: isOpen && cashSalesToday > 0 ? "success" : "neutral",
      icon: TrendingUp,
    },
    {
      title: "Orders Processed",
      value: `${totalOrdersToday} Orders`,
      badgeText:
        isOpen && totalOrdersToday > 0
          ? `${totalOrdersToday} Processed`
          : isOpen
            ? "Ready"
            : "Standby",
      badgeVariant: isOpen && totalOrdersToday > 0 ? "success" : "neutral",
      icon: ShoppingBag,
    },
  ];

  return (
    <StatGrid>
      {statItems.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </StatGrid>
  );
};

export default CashSessionStats;
