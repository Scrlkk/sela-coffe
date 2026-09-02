import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Store,
  Clock,
  ShoppingCart,
  ArrowRight,
  Lock,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { RevenueOverviewCard } from "@/components/dashboard/RevenueOverviewCard";
import { SalesByCategoryCard } from "@/components/dashboard/SalesByCategoryCard";
import { TodaysTransactionsCard } from "@/components/dashboard/TodaysTransactionsCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import {
  STAT_CARDS,
  FILTER_OPTIONS,
  REVENUE_OVERVIEW_DATA,
  SALES_BY_CATEGORY_DATA,
} from "@/constants/dashboard";
import {
  getSalesReportData,
  getBestSellerReportData,
  type DateRangeFilter,
} from "@/services/report";
import { safeStorage } from "@/utils/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/utils/formatCurrency";
import {
  cashSessionService,
  type ActiveCashSession,
} from "@/services/cashSession";
import { CloseSessionDialog } from "@/components/cash-session/CloseSessionDialog";

const DASHBOARD_PERIOD_STORAGE_KEY = "sela_dashboard_revenue_period";

const PERIOD_MAP: Record<string, DateRangeFilter> = {
  "This Week": "this_week",
  "Last 7 Days": "last_7_days",
  "Last Week": "last_7_days",
  "This Month": "this_month",
  "Last Month": "last_month",
  "All Time": "all_time",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<string>(() => {
    const saved = safeStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
    if (saved && (FILTER_OPTIONS as readonly string[]).includes(saved)) {
      return saved;
    }
    return "All Time";
  });
  const [loadingRev, setLoadingRev] = useState<boolean>(false);
  const [loadingTxn, setLoadingTxn] = useState<boolean>(false);
  const [loadingAct, setLoadingAct] = useState<boolean>(false);

  const [activeSession, setActiveSession] = useState<ActiveCashSession | null>(
    () => cashSessionService.getActiveSession(),
  );
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = () => {
      setActiveSession(cashSessionService.getActiveSession());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const triggerCardRefresh = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(true);
    setTimeout(() => setter(false), 700);
  };

  const handleCloseRegister = (actualCash: number, note?: string) => {
    try {
      cashSessionService.closeSession(actualCash, note);
      setActiveSession(null);
      setIsCloseDialogOpen(false);
      toast.success("Cash register shift closed successfully!");
    } catch {
      toast.error("Failed to close cash session");
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    safeStorage.setItem(DASHBOARD_PERIOD_STORAGE_KEY, newPeriod);
    triggerCardRefresh(setLoadingRev);
  };

  const mappedFilter: DateRangeFilter = PERIOD_MAP[period] || "all_time";

  const { revenueData, categoryData } = useMemo(() => {
    try {
      const salesReport = getSalesReportData(mappedFilter);
      const bestSellerReport = getBestSellerReportData(mappedFilter);

      const rev =
        salesReport.revenueTrend && salesReport.revenueTrend.length > 0
          ? salesReport.revenueTrend.map((t) => ({
              day: t.label,
              revenue: t.revenue,
            }))
          : REVENUE_OVERVIEW_DATA;

      const cat =
        bestSellerReport.categorySales &&
        bestSellerReport.categorySales.length > 0
          ? bestSellerReport.categorySales.map((c) => ({
              category: c.category,
              percentage: c.percentage,
              color: c.color,
            }))
          : SALES_BY_CATEGORY_DATA;

      return { revenueData: rev, categoryData: cat };
    } catch {
      return {
        revenueData: REVENUE_OVERVIEW_DATA,
        categoryData: SALES_BY_CATEGORY_DATA,
      };
    }
  }, [mappedFilter]);

  const isOpen = Boolean(activeSession?.isOpen);
  const expectedDrawerCash =
    (activeSession?.openingFloat ?? 0) + (activeSession?.cashSales ?? 0);

  return (
    <div className="space-y-6">
      {isOpen && activeSession && (
        <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl bg-card border border-primary/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base font-mono">
                  {activeSession.id}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-lg text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Live Shift
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Started {activeSession.openedAt} by{" "}
                <span className="font-semibold text-foreground">
                  {activeSession.openedBy}
                </span>{" "}
                · Expected in Drawer:{" "}
                <span className="font-mono font-extrabold text-foreground">
                  {formatRupiah(expectedDrawerCash)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => navigate("/cashier")}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer gap-1.5 px-3.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open Cashier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              onClick={() => setIsCloseDialogOpen(true)}
              variant="outline"
              className="h-9.5 rounded-xl border-border/80 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-foreground text-xs font-bold transition-all cursor-pointer gap-1.5 px-3"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Close Shift</span>
            </Button>
          </div>
        </div>
      )}

      <StatGrid>
        {STAT_CARDS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        <RevenueOverviewCard
          data={revenueData}
          period={period}
          onPeriodChange={handlePeriodChange}
          isLoading={loadingRev}
          onRefresh={() => triggerCardRefresh(setLoadingRev)}
          className="lg:col-span-3 h-full max-h-96"
        />

        <SalesByCategoryCard
          data={categoryData}
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

      <CloseSessionDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        expectedCash={expectedDrawerCash}
        openingFloat={activeSession?.openingFloat ?? 0}
        cashSales={activeSession?.cashSales ?? 0}
        onConfirmClose={handleCloseRegister}
      />
    </div>
  );
}
