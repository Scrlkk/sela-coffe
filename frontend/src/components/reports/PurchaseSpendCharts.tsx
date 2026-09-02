import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type {
  PurchaseSpendTrendPoint,
  SupplierSpendShare,
} from "@/services/report";
import type { PurchaseOrderItem } from "@/services/purchase";
import { cn } from "@/lib/utils";
import { Truck, CheckCircle, Clock, XCircle } from "lucide-react";

interface PurchaseSpendTrendCardProps {
  data: PurchaseSpendTrendPoint[];
  periodLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export const PurchaseSpendTrendCard: React.FC<PurchaseSpendTrendCardProps> = ({
  data,
  periodLabel = "Selected Period",
  isLoading = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md select-none flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Procurement Spend Trend
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            {periodLabel}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative flex-1 flex flex-col justify-between mt-1 w-full min-h-44 sm:min-h-48">
        {isLoading ? (
          <div className="w-full h-full min-h-44 sm:min-h-48 flex flex-col justify-between space-y-3 pt-1">
            <div className="flex items-center justify-between pt-0.5">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>

            <div className="w-full flex-1 flex flex-col justify-between py-2 px-1 space-y-2">
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-40" />
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-20" />
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-6 rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex-1 min-h-44 sm:min-h-48 outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="poSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b44a3a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#b44a3a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--foreground)"
                  strokeOpacity={0.12}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  dy={6}
                />

                <YAxis
                  width={78}
                  tickCount={5}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(val: number) => formatRupiah(val, true)}
                  domain={[
                    0,
                    (dataMax: number) => Math.ceil((dataMax || 100) * 1.15),
                  ]}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]
                        .payload as PurchaseSpendTrendPoint;
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-2.5 py-1.5 shadow-lg text-foreground text-[11px] space-y-0.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold text-foreground">
                            {item.label} ({item.dateKey})
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium flex justify-between gap-3">
                            <span>Total Spend:</span>
                            <span className="font-semibold text-foreground font-mono">
                              {formatRupiah(item.spend)}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium flex justify-between gap-3">
                            <span>PO Count:</span>
                            <span className="font-semibold text-foreground font-mono">
                              {item.ordersCount} orders
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#b44a3a"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#poSpendGrad)"
                  isAnimationActive={false}
                  dot={{
                    r: 3.5,
                    fill: "#b44a3a",
                    stroke: "var(--card)",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5.5,
                    fill: "#b44a3a",
                    stroke: "var(--card)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SupplierShareCardProps {
  data: SupplierSpendShare[];
  periodLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export const SupplierShareCard: React.FC<SupplierShareCardProps> = ({
  data,
  periodLabel = "Selected Period",
  isLoading = false,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = data.map((item) => ({
    name: item.supplierName,
    value: item.totalSpend || 0,
    percentage: item.percentage,
    fill: item.color,
  }));

  const activeSlice = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md select-none flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Supplier Spend Share
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            {periodLabel}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col sm:flex-row lg:flex-col items-center justify-center sm:justify-between lg:justify-between gap-3 sm:gap-6 lg:gap-2 my-auto w-full">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="w-full space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No supplier transactions for this period.
          </div>
        ) : (
          <>
            <div
              className="relative w-40 sm:w-44 lg:w-full h-40 sm:h-40 lg:h-36 flex items-center justify-center shrink-0 my-0.5 outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-sector]:outline-none"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`sup-cell-${index}`}
                        fill={entry.fill}
                        stroke="transparent"
                        style={{
                          outline: "none",
                          cursor: "pointer",
                          filter:
                            hoveredIdx === index
                              ? "brightness(1.1) drop-shadow(0px 2.5px 6px rgba(0,0,0,0.16))"
                              : hoveredIdx !== null
                                ? "opacity(0.65)"
                                : "none",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                {activeSlice ? (
                  <div className="animate-in fade-in zoom-in-90 duration-150">
                    <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Share
                    </span>
                    <span className="block text-sm sm:text-base font-extrabold text-foreground font-mono">
                      {activeSlice.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-150 opacity-60">
                    <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                      Total
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-foreground">
                      100%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="w-full max-w-xs sm:max-w-none lg:w-full max-h-32 overflow-y-auto no-scrollbar space-y-1"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {data.map((item, idx) => {
                const isActive = hoveredIdx === idx;
                return (
                  <div
                    key={item.supplierId + idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    className={cn(
                      "flex items-center justify-between text-[11px] sm:text-xs font-medium cursor-pointer py-1 px-2 rounded-lg transition-all w-full",
                      isActive
                        ? "bg-secondary/65 font-bold text-foreground"
                        : "hover:bg-secondary/30 text-foreground/80",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform"
                        style={{
                          backgroundColor: item.color,
                          transform: isActive ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                      <span className="truncate font-medium text-foreground/90">
                        {item.supplierName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono shrink-0 ml-auto pl-2 whitespace-nowrap">
                      <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                        ({formatRupiah(item.totalSpend, true)})
                      </span>
                      <span className="font-semibold text-foreground min-w-7 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface PurchaseOrdersSummaryTableProps {
  orders: PurchaseOrderItem[];
  isLoading?: boolean;
  className?: string;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const PurchaseOrdersSummaryTable: React.FC<
  PurchaseOrdersSummaryTableProps
> = ({
  orders,
  isLoading = false,
  className,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  totalItems = orders.length,
  onPageChange,
  onPageSizeChange,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return (
          <Badge
            variant="outline"
            className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Received
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 gap-1"
          >
            <XCircle className="w-3 h-3" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1"
          >
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-border/60">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Purchase Orders History
          </CardTitle>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            List of raw material procurements for the selected period
          </p>
        </div>
        <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-xl w-fit">
          {totalItems} POs recorded
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2.5 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-xs">
          No PO data found for this period.
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10 text-[11px]">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 hidden lg:table-cell">PO Number</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5">Supplier</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5">Order Date</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center">Items Count</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">Total Cost</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {orders.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 font-mono font-bold text-foreground whitespace-nowrap hidden lg:table-cell">
                      {po.po_number}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-45">
                            {po.supplier_name}
                          </span>
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-primary block truncate lg:hidden mt-0.5">
                          {po.po_number}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(po.order_date || po.createdAt)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center font-mono">
                      <span className="bg-secondary/70 text-foreground px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                        {formatNumber(po.items?.length || 0)} items
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatRupiah(po.total_amount)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center whitespace-nowrap">
                      {getStatusBadge(po.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden space-y-3 pt-3">
            {orders.map((po) => (
              <div
                key={po.id}
                className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-foreground">
                    {po.po_number}
                  </span>
                  {getStatusBadge(po.status)}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{po.supplier_name}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground">
                    {formatDate(po.order_date || po.createdAt)}
                  </span>
                  <span className="font-mono bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {formatNumber(po.items?.length || 0)} items
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Total Cost
                  </span>
                  <span className="font-bold text-xs text-foreground font-mono">
                    {formatRupiah(po.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {onPageChange && totalItems > 0 && (
            <div className="pt-3 mt-1 border-t border-border/60">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="POs"
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};
