import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Trophy,
  ShoppingBag,
  RotateCw,
  Download,
  Calendar,
  ChartNoAxesColumn,
  Tag,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import {
  BestSellerRankTable,
  CategoryVolumeChart,
} from "@/components/reports/BestSellerLeaderboard";
import { Button } from "@/components/ui/button";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import {
  getBestSellerReportData,
  REPORT_PERIOD_OPTIONS,
  type DateRangeFilter,
} from "@/services/report";
import { useReportPeriod } from "@/hooks/useReportPeriod";
import { getStoredCategories, type CategoryItem } from "@/services/category";
import { cn } from "@/lib/utils";

export default function BestSellerReportPage() {
  const { period, setPeriod } = useReportPeriod();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      return getStoredCategories(false, "product");
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncTick, setSyncTick] = useState<number>(0);

  const reportData = useMemo(() => {
    void syncTick;
    return getBestSellerReportData(period, selectedCategory);
  }, [period, selectedCategory, syncTick]);

  const leaderboard = reportData.leaderboard;

  const handlePeriodChange = (val: DateRangeFilter) => {
    setPeriod(val);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
  };

  useEffect(() => {
    const handleSync = () => {
      setSyncTick((v) => v + 1);
      try {
        setCategories(getStoredCategories(false, "product"));
      } catch {
        // fallback
      }
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSyncTick((v) => v + 1);
      setIsLoading(false);
      toast.success("Best seller report updated");
    }, 300);
  };

  const periodOptions = useMemo(
    () =>
      REPORT_PERIOD_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
    [],
  );

  const categoryOptions = useMemo(
    () => [
      { id: "all", label: "All Categories" },
      ...categories.map((c) => ({ id: c.id, label: c.name })),
    ],
    [categories],
  );

  const handleExportCSV = () => {
    try {
      const headers = [
        "Rank",
        "Product Name",
        "Category",
        "Units Sold",
        "Total Revenue",
        "Contribution (%)",
      ];
      const rows = reportData.leaderboard.map((row) => [
        `#${row.rank}`,
        `"${row.name}"`,
        row.category,
        row.unitsSold,
        row.totalRevenue,
        row.percentageContribution,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `best-sellers-report-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Best seller report exported successfully (CSV)");
    } catch {
      toast.error("Failed to export report");
    }
  };

  const { stats, categorySales } = reportData;

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Top Performing Menu"
          value={stats.topProduct}
          icon={Trophy}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Units Sold"
          value={`${formatNumber(stats.totalUnitsSold)} items`}
          icon={ShoppingBag}
          isLoading={isLoading}
        />
        <StatCard
          title="Best Seller Revenue"
          value={formatRupiah(stats.bestSellerRevenue)}
          icon={ChartNoAxesColumn}
          isLoading={isLoading}
        />
        <StatCard
          title="Most Popular Category"
          value={stats.topCategory}
          icon={Tag}
          isLoading={isLoading}
        />
      </StatGrid>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="w-full sm:w-56 min-w-0">
          <FormDropdownPicker
            value={period}
            onChange={(val) => handlePeriodChange(val as DateRangeFilter)}
            options={periodOptions}
            icon={Calendar}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9.5 rounded-xl border-border/80 text-foreground text-xs font-bold gap-1.5 px-3.5 shadow-2xs hover:bg-muted/80 transition-all active:scale-[0.99] cursor-pointer justify-center flex-1 sm:flex-none"
          >
            <RotateCw
              className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleExportCSV}
            className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer justify-center flex-1 sm:flex-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <BestSellerRankTable
            items={leaderboard}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categoryOptions={categoryOptions}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <CategoryVolumeChart data={categorySales} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
