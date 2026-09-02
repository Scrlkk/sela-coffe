import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Pagination } from "@/components/shared/Pagination";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import type {
  CategoryValuationBreakdown,
  StockHealthItem,
} from "@/services/report";
import { cn } from "@/lib/utils";
import { Layers, Filter } from "lucide-react";

interface InventoryValuationCardProps {
  data: CategoryValuationBreakdown[];
  isLoading?: boolean;
  className?: string;
}

export const InventoryValuationCard: React.FC<InventoryValuationCardProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
          Stock Asset Valuation
        </CardTitle>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
          Inventory capital value by raw material category
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-between min-h-65 w-full">
        {isLoading ? (
          <div className="w-full flex-1 flex flex-col justify-between py-2 space-y-3">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No valuation data recorded.
          </div>
        ) : (
          <div className="w-full h-full flex-1 min-h-65 outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="4 4"
                  stroke="var(--foreground)"
                  strokeOpacity={0.1}
                />
                <XAxis
                  type="number"
                  tickFormatter={(val) => formatRupiah(val, true)}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="categoryName"
                  type="category"
                  width={95}
                  tick={{
                    fontSize: 11,
                    fill: "var(--foreground)",
                    fontWeight: 500,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "currentColor", opacity: 0.08, rx: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]
                        .payload as CategoryValuationBreakdown;
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl text-foreground text-xs space-y-1 z-50">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.categoryName}</span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4 pt-0.5">
                            <span>Valuation:</span>
                            <span className="font-bold text-foreground font-mono">
                              {formatRupiah(item.totalValuation)}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4">
                            <span>Asset Share:</span>
                            <span className="font-bold text-foreground font-mono">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4">
                            <span>Item Lines:</span>
                            <span className="font-bold text-foreground font-mono">
                              {item.itemsCount} items
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="totalValuation"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StockDepletionTableProps {
  items: StockHealthItem[];
  isLoading?: boolean;
  className?: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: { id: string; label: string }[];
  selectedStatus?: "all" | "Safe" | "Low Stock" | "Critical";
  onStatusChange?: (status: "all" | "Safe" | "Low Stock" | "Critical") => void;
  statusOptions?: { id: string; label: string }[];
}

export const StockDepletionTable: React.FC<StockDepletionTableProps> = ({
  items,
  isLoading = false,
  className,
  selectedCategory = "all",
  onCategoryChange,
  categoryOptions = [],
  selectedStatus = "all",
  onStatusChange,
  statusOptions = [],
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const handleCategoryChange = (cat: string) => {
    setCurrentPage(1);
    onCategoryChange?.(cat);
  };

  const handleStatusChange = (
    stat: "all" | "Safe" | "Low Stock" | "Critical",
  ) => {
    setCurrentPage(1);
    onStatusChange?.(stat);
  };

  const getStatusBadge = (status: "Safe" | "Low Stock" | "Critical") => {
    switch (status) {
      case "Critical":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 animate-pulse" />
            <span>Critical</span>
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span>Low</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Safe</span>
          </span>
        );
    }
  };

  const renderMobileStatusDot = (status: "Safe" | "Low Stock" | "Critical") => {
    switch (status) {
      case "Critical":
        return (
          <span
            title="Critical"
            className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0 animate-pulse ring-4 ring-destructive/20 inline-block"
          />
        );
      case "Low Stock":
        return (
          <span
            title="Low"
            className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse ring-4 ring-amber-500/20 inline-block"
          />
        );
      default:
        return (
          <span
            title="Safe"
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-500/20 inline-block"
          />
        );
    }
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col overflow-visible",
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60 relative z-20">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Stock Health & Depletion Estimation
          </CardTitle>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Monitoring raw material stock levels
          </p>
        </div>

        {onCategoryChange && onStatusChange && (
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full lg:w-auto min-w-0">
            <div className="w-full sm:w-44 min-w-0">
              <FormDropdownPicker
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={categoryOptions}
                icon={Layers}
                className="w-full text-xs"
              />
            </div>
            <div className="w-full sm:w-36 min-w-0">
              <FormDropdownPicker
                value={selectedStatus}
                onChange={(val) =>
                  handleStatusChange(
                    val as "all" | "Safe" | "Low Stock" | "Critical",
                  )
                }
                options={statusOptions}
                icon={Filter}
                className="w-full text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-xs">
          No ingredient matches the selected filter.
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10 text-[11px]">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5">Raw Material</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">Current Stock</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center hidden xl:table-cell">Capacity</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right hidden md:table-cell">Valuation</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate max-w-44 sm:max-w-none block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatNumber(item.currentStock)} {item.unit}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 hidden xl:table-cell">
                      <div className="w-24 mx-auto space-y-1">
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              item.status === "Critical"
                                ? "bg-destructive"
                                : item.status === "Low Stock"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                            style={{ width: `${item.percentageFill}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground text-center font-mono">
                          {item.percentageFill}%
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">
                      {formatRupiah(item.valuation)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        {getStatusBadge(item.status)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden space-y-2.5 pt-2.5">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-foreground block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground block truncate mt-0.5">
                      {item.category}
                    </span>
                  </div>
                  <div className="pt-0.5 shrink-0" title={item.status}>
                    {renderMobileStatusDot(item.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground text-[11px]">Current Stock</span>
                  <span className="font-bold font-mono text-foreground">
                    {formatNumber(item.currentStock)} {item.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
                  <span className="text-muted-foreground text-[11px]">Valuation</span>
                  <span className="font-bold font-mono text-xs text-foreground">
                    {formatRupiah(item.valuation)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="pt-3 mt-1 border-t border-border/60">
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={items.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
                itemLabel="ingredients"
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};
