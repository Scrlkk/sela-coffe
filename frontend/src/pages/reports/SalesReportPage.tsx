
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Receipt,
  CircleDollarSign,
  CreditCard,
  RotateCw,
  Download,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import {
  SalesRevenueTrendCard,
  PaymentMethodDistributionCard,
} from "@/components/reports/SalesReportCharts";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Pagination } from "@/components/shared/Pagination";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import {
  getSalesReportData,
  REPORT_PERIOD_OPTIONS,
  type DateRangeFilter,
} from "@/services/report";
import { useReportPeriod } from "@/hooks/useReportPeriod";
import { cn } from "@/lib/utils";

export default function SalesReportPage() {
  const { period, setPeriod } = useReportPeriod();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncTick, setSyncTick] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const reportData = useMemo(() => {
    void syncTick;
    return getSalesReportData(period);
  }, [period, syncTick]);

  useEffect(() => {
    const handleSync = () => setSyncTick((v) => v + 1);
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
      toast.success("Sales report updated");
    }, 300);
  };

  const handlePeriodChange = (val: DateRangeFilter) => {
    setPeriod(val);
    setCurrentPage(1);
  };

  const activePeriodLabel =
    REPORT_PERIOD_OPTIONS.find((o) => o.value === period)?.label || "Period";

  const periodOptions = useMemo(
    () =>
      REPORT_PERIOD_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
    [],
  );

  const handleExportCSV = () => {
    try {
      const headers = [
        "Date",
        "Total Orders",
        "Cash",
        "QRIS",
        "Debit/Card",
        "Total Revenue",
      ];
      const rows = reportData.salesSummaryTable.map((row) => [
        row.formattedDate || row.date,
        row.orders,
        row.cash,
        row.qris,
        row.card,
        row.total,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `sales-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Sales report exported successfully (CSV)");
    } catch {
      toast.error("Failed to export report");
    }
  };

  const { stats, revenueTrend, paymentMethodBreakdown, salesSummaryTable } =
    reportData;

  const totalPages = Math.ceil(salesSummaryTable.length / pageSize) || 1;
  const paginatedSalesTable = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return salesSummaryTable.slice(start, start + pageSize);
  }, [salesSummaryTable, currentPage, pageSize]);

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Revenue"
          value={formatRupiah(stats.totalRevenue)}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Transactions"
          value={`${formatNumber(stats.totalOrders)} Trx`}
          icon={Receipt}
          isLoading={isLoading}
        />
        <StatCard
          title="Average Order Value"
          value={formatRupiah(stats.averageOrderValue)}
          icon={CircleDollarSign}
          isLoading={isLoading}
        />
        <StatCard
          title="Non-Cash Ratio"
          value={`${stats.nonCashRatio}%`}
          icon={CreditCard}
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
        <SalesRevenueTrendCard
          data={revenueTrend}
          periodLabel={activePeriodLabel}
          isLoading={isLoading}
          className="lg:col-span-7 xl:col-span-8 h-full max-h-96"
        />
        <PaymentMethodDistributionCard
          data={paymentMethodBreakdown}
          periodLabel={activePeriodLabel}
          isLoading={isLoading}
          className="lg:col-span-5 xl:col-span-4 h-full max-h-96"
        />
      </div>

      <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-border/60">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
              Daily Sales Summary
            </CardTitle>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Breakdown of revenue per date
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-xl w-fit">
            {salesSummaryTable.length} days recorded
          </span>
        </div>

        {salesSummaryTable.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs">
            No sales data found for this period.
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10 text-[11px]">
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5">Date</th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center hidden lg:table-cell">
                      Orders
                    </th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">
                      Cash
                    </th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">
                      QRIS
                    </th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">
                      Debit / Card
                    </th>
                    <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">
                      Total Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {paginatedSalesTable.map((row) => (
                    <tr
                      key={row.date}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5">
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground whitespace-nowrap block">
                            {row.formattedDate}
                          </span>
                          <span className="text-[10.5px] font-mono text-muted-foreground block lg:hidden mt-0.5 font-normal">
                            {formatNumber(row.orders)} orders
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center font-mono text-muted-foreground text-xs font-medium hidden lg:table-cell">
                        {formatNumber(row.orders)} orders
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {formatRupiah(row.cash)}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {formatRupiah(row.qris)}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                        {formatRupiah(row.card)}
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatRupiah(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="block sm:hidden space-y-3 pt-3">
              {paginatedSalesTable.map((row) => (
                <div
                  key={row.date}
                  className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground">
                      {row.formattedDate}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground font-medium">
                      {formatNumber(row.orders)} orders
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Total Revenue
                    </span>
                    <span className="font-bold text-xs text-foreground font-mono">
                      {formatRupiah(row.total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-border/30 text-[10px]">
                    <div className="bg-card/70 p-1.5 rounded-lg border border-border/40">
                      <span className="text-muted-foreground block text-[9px]">
                        Cash
                      </span>
                      <span className="font-semibold font-mono text-foreground truncate block">
                        {formatRupiah(row.cash, true)}
                      </span>
                    </div>
                    <div className="bg-card/70 p-1.5 rounded-lg border border-border/40">
                      <span className="text-muted-foreground block text-[9px]">
                        QRIS
                      </span>
                      <span className="font-semibold font-mono text-foreground truncate block">
                        {formatRupiah(row.qris, true)}
                      </span>
                    </div>
                    <div className="bg-card/70 p-1.5 rounded-lg border border-border/40">
                      <span className="text-muted-foreground block text-[9px]">
                        Card
                      </span>
                      <span className="font-semibold font-mono text-foreground truncate block">
                        {formatRupiah(row.card, true)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {salesSummaryTable.length > 0 && (
              <div className="pt-3 mt-1 border-t border-border/60">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={salesSummaryTable.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                  itemLabel="days"
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
