import React from "react";
import { DollarSign, Banknote, TrendingUp, ShoppingBag } from "lucide-react";
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
  totalOrdersToday = 18,
}) => {
  const statItems: StatCardProps[] = [
    {
      title: "Current Session",
      value: isOpen ? "Open" : "Closed",
      badgeText: isOpen ? "Active" : "Closed",
      badgeVariant: isOpen ? "success" : "danger",
      icon: DollarSign,
    },
    {
      title: "Opening Float",
      value:
        isOpen && openingFloat !== null ? formatRupiah(openingFloat) : "—",
      icon: Banknote,
    },
    {
      title: "Cash Sales Today",
      value: formatRupiah(cashSalesToday),
      icon: TrendingUp,
    },
    {
      title: "Total Orders Today",
      value: `${totalOrdersToday} Orders`,
      badgeText: "Today",
      badgeVariant: "success",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="mb-6">
      <StatGrid>
        {statItems.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </StatGrid>
    </div>
  );
};
