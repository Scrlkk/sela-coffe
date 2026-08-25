import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { RevenueOverviewCard } from "@/components/dashboard/RevenueOverviewCard";
import { SalesByCategoryCard } from "@/components/dashboard/SalesByCategoryCard";
import { TodaysTransactionsCard } from "@/components/dashboard/TodaysTransactionsCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { STAT_CARDS } from "@/constants/dashboard";

export default function DashboardPage() {
  const [period, setPeriod] = useState<string>("This Week");
  const [loadingRev, setLoadingRev] = useState<boolean>(false);
  const [loadingTxn, setLoadingTxn] = useState<boolean>(false);
  const [loadingAct, setLoadingAct] = useState<boolean>(false);

  const triggerCardRefresh = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(true);
    setTimeout(() => setter(false), 700);
  };

  return (
    <div className="space-y-6">
      <StatGrid>
        {STAT_CARDS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        <RevenueOverviewCard
          period={period}
          onPeriodChange={(newPeriod) => {
            setPeriod(newPeriod);
            triggerCardRefresh(setLoadingRev);
          }}
          isLoading={loadingRev}
          onRefresh={() => triggerCardRefresh(setLoadingRev)}
          className="lg:col-span-3 h-full max-h-96"
        />

        <SalesByCategoryCard
          period={period}
          isLoading={loadingRev}
          className="lg:col-span-1 h-full max-h-96"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <TodaysTransactionsCard
          isLoading={loadingTxn}
          onRefresh={() => triggerCardRefresh(setLoadingTxn)}
          className="h-full lg:col-span-2 max-h-96"
        />
        <RecentActivityCard
          isLoading={loadingAct}
          onRefresh={() => triggerCardRefresh(setLoadingAct)}
          className="h-full lg:col-span-1 max-h-96"
        />
      </div>
    </div>
  );
}
