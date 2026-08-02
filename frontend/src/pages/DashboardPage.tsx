import { useState, lazy, Suspense } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodaysTransactionsCard } from "@/components/dashboard/TodaysTransactionsCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { STAT_CARDS } from "@/constants/dashboard";

const RevenueOverviewCard = lazy(
  () => import("@/components/dashboard/RevenueOverviewCard"),
);
const SalesByCategoryCard = lazy(
  () => import("@/components/dashboard/SalesByCategoryCard"),
);

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
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {STAT_CARDS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Synchronized Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        <Suspense
          fallback={
            <Skeleton className="lg:col-span-3 h-full min-h-80 rounded-2xl" />
          }
        >
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
        </Suspense>

        <Suspense
          fallback={
            <Skeleton className="lg:col-span-1 h-full min-h-80 rounded-2xl" />
          }
        >
          <SalesByCategoryCard
            period={period}
            isLoading={loadingRev}
            className="lg:col-span-1 h-full max-h-96"
          />
        </Suspense>
      </div>

      {/* Today's Transactions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <TodaysTransactionsCard
          isLoading={loadingTxn}
          onRefresh={() => triggerCardRefresh(setLoadingTxn)}
          className="h-full max-h-96"
        />
        <RecentActivityCard
          isLoading={loadingAct}
          onRefresh={() => triggerCardRefresh(setLoadingAct)}
          className="h-full max-h-96"
        />
      </div>
    </div>
  );
}
