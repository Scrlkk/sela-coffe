import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  FileSpreadsheet,
  Truck,
  Clock,
  RotateCw,
  Download,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import {
  PurchaseSpendTrendCard,
  SupplierShareCard,
  PurchaseOrdersSummaryTable,
} from "@/components/reports/PurchaseSpendCharts";
import { Button } from "@/components/ui/button";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import {
  getPurchaseReportData,
  REPORT_PERIOD_OPTIONS,
  type DateRangeFilter,
} from "@/services/report";
import { useReportPeriod } from "@/hooks/useReportPeriod";
import { getStoredSuppliers, type SupplierItem } from "@/services/supplier";
import { cn } from "@/lib/utils";

export default function PurchaseReportPage() {
  const { period, setPeriod } = useReportPeriod();
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    try {
      return getStoredSuppliers(false);
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncTick, setSyncTick] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const reportData = useMemo(() => {
    void syncTick;
    return getPurchaseReportData(period, selectedSupplier);
  }, [period, selectedSupplier, syncTick]);

  useEffect(() => {
    const handleSync = () => {
      setSyncTick((v) => v + 1);
      try {
        setSuppliers(getStoredSuppliers(false));
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
      setCurrentPage(1);
      setIsLoading(false);
      toast.success("Purchase report updated");
    }, 300);
  };

  const handlePeriodChange = (val: DateRangeFilter) => {
    setPeriod(val);
    setCurrentPage(1);
  };

  const handleSupplierChange = (val: string) => {
    setSelectedSupplier(val);
    setCurrentPage(1);
  };

  const activePeriodLabel =
    REPORT_PERIOD_OPTIONS.find((o) => o.value === period)?.label || "Period";

  const periodOptions = useMemo(
    () =>
      REPORT_PERIOD_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
    [],
  );

  const supplierOptions = useMemo(
    () => [
      { id: "all", label: "All Suppliers" },
      ...suppliers.map((s) => ({ id: s.id, label: s.name })),
    ],
    [suppliers],
  );

  const handleExportCSV = () => {
    try {
      const headers = [
        "PO Number",
        "Supplier",
        "Order Date",
        "Status",
        "Items Count",
        "Total Amount",
      ];
      const rows = reportData.recentPurchaseOrders.map((po) => [
        po.po_number,
        `"${po.supplier_name}"`,
        po.order_date || po.createdAt,
        po.status,
        po.items?.length || 0,
        po.total_amount,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `purchase-report-po-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Purchase report exported successfully (CSV)");
    } catch {
      toast.error("Failed to export purchase report");
    }
  };

  const { stats, spendTrend, supplierSpendShare, recentPurchaseOrders } =
    reportData;

  const totalPages = Math.ceil(recentPurchaseOrders.length / pageSize) || 1;
  const paginatedPurchaseOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return recentPurchaseOrders.slice(start, start + pageSize);
  }, [recentPurchaseOrders, currentPage, pageSize]);

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total PO Spend"
          value={formatRupiah(stats.totalSpend)}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Purchase Orders"
          value={`${formatNumber(stats.totalOrders)} PO`}
          icon={FileSpreadsheet}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Suppliers"
          value={`${formatNumber(stats.activeSuppliersCount)} Vendors`}
          icon={Truck}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Deliveries"
          value={`${formatNumber(stats.pendingDeliveries)} PO`}
          icon={Clock}
          badgeText={stats.pendingDeliveries > 0 ? "In Transit" : "All Arrived"}
          badgeVariant={stats.pendingDeliveries > 0 ? "danger" : "success"}
          isLoading={isLoading}
        />
      </StatGrid>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5 sm:gap-3 w-full lg:w-auto min-w-0">
          <div className="w-full lg:w-48 min-w-0">
            <FormDropdownPicker
              value={period}
              onChange={(val) => handlePeriodChange(val as DateRangeFilter)}
              options={periodOptions}
              icon={Calendar}
              className="w-full lg:w-48"
            />
          </div>

          <div className="w-full lg:w-52 min-w-0">
            <FormDropdownPicker
              value={selectedSupplier}
              onChange={handleSupplierChange}
              options={supplierOptions}
              icon={Truck}
              className="w-full lg:w-52"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 w-full lg:w-auto pt-0.5 lg:pt-0">
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
        <PurchaseSpendTrendCard
          data={spendTrend}
          periodLabel={activePeriodLabel}
          isLoading={isLoading}
          className="lg:col-span-7 xl:col-span-8 h-full max-h-96"
        />
        <SupplierShareCard
          data={supplierSpendShare}
          periodLabel={activePeriodLabel}
          isLoading={isLoading}
          className="lg:col-span-5 xl:col-span-4 h-full max-h-96"
        />
      </div>

      <PurchaseOrdersSummaryTable
        orders={paginatedPurchaseOrders}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={recentPurchaseOrders.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
