import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Boxes,
  Coins,
  AlertTriangle,
  Layers,
  RotateCw,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import {
  InventoryValuationCard,
  StockDepletionTable,
} from "@/components/reports/InventoryHealthCharts";
import {
  getInventoryReportData,
  REPORT_PERIOD_OPTIONS,
  type DateRangeFilter,
} from "@/services/report";
import { useReportPeriod } from "@/hooks/useReportPeriod";
import { getStoredCategories, type CategoryItem } from "@/services/category";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

export default function InventoryReportPage() {
  const { period, setPeriod } = useReportPeriod();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "Safe" | "Low Stock" | "Critical"
  >("all");
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      return getStoredCategories(false, "ingredient");
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncTick, setSyncTick] = useState<number>(0);

  const reportData = useMemo(() => {
    void syncTick;
    return getInventoryReportData(period, selectedCategory, selectedStatus);
  }, [period, selectedCategory, selectedStatus, syncTick]);

  useEffect(() => {
    const handleSync = () => {
      setSyncTick((v) => v + 1);
      try {
        setCategories(getStoredCategories(false, "ingredient"));
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
      toast.success("Inventory report updated");
    }, 300);
  };

  const periodOptions = useMemo(
    () => REPORT_PERIOD_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
    [],
  );

  const categoryOptions = useMemo(
    () => [
      { id: "all", label: "All Categories" },
      ...categories.map((c) => ({ id: c.name, label: c.name })),
    ],
    [categories],
  );

  const statusOptions = useMemo(
    () => [
      { id: "all", label: "All Status" },
      { id: "Safe", label: "Safe" },
      { id: "Low Stock", label: "Low" },
      { id: "Critical", label: "Critical" },
    ],
    [],
  );

  const handleExportCSV = () => {
    try {
      const headers = [
        "Ingredient Name",
        "Category",
        "Unit",
        "Current Stock",
        "Min Stock",
        "Cost Price",
        "Total Valuation",
        "Status",
        "Estimated Days Remaining",
      ];
      const rows = reportData.stockHealthList.map((item) => [
        `"${item.name}"`,
        item.category,
        item.unit,
        item.currentStock,
        item.minStock,
        item.costPrice,
        item.valuation,
        item.status,
        item.estimatedDaysRemaining,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `inventory-stock-report-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Inventory report exported successfully (CSV)");
    } catch {
      toast.error("Failed to export inventory report");
    }
  };

  const { stats, categoryValuation, stockHealthList } = reportData;

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Ingredient Types"
          value={`${formatNumber(stats.totalItems)} Items`}
          icon={Boxes}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Stock Valuation"
          value={formatRupiah(stats.totalValuation)}
          icon={Coins}
          isLoading={isLoading}
        />
        <StatCard
          title="Low / Critical Stock"
          value={`${formatNumber(stats.lowStockCount)} Items`}
          icon={AlertTriangle}
          badgeText={stats.lowStockCount > 0 ? "Needs Reorder" : "Stock Healthy"}
          badgeVariant={stats.lowStockCount > 0 ? "danger" : "success"}
          isLoading={isLoading}
        />
        <StatCard
          title="Top Asset Category"
          value={stats.topCategory}
          icon={Layers}
          badgeText={
            stats.topCategoryPercentage > 0
              ? `${stats.topCategoryPercentage}% of Assets`
              : undefined
          }
          badgeVariant="neutral"
          isLoading={isLoading}
        />
      </StatGrid>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="w-full sm:w-56 min-w-0">
          <FormDropdownPicker
            value={period}
            onChange={(val) => setPeriod(val as DateRangeFilter)}
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
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <InventoryValuationCard
            data={categoryValuation}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <StockDepletionTable
            items={stockHealthList}
            isLoading={isLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categoryOptions={categoryOptions}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            statusOptions={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}
