import React, { useState, useMemo, useDeferredValue } from "react";
import type { StockLogItem, StockLogType } from "@/services/stock";
import { getStoredStockLogs } from "@/services/stock";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { SortableTh } from "@/components/shared/SortableTh";
import { Pagination } from "@/components/shared/Pagination";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownUp,
  Filter,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { formatDate, formatDateTime, formatTime } from "@/utils/formatDate";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { StockMovementDetailDialog } from "@/components/stock-movement/StockMovementDetailDialog";

type DateRangeFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH";

const DATE_RANGE_OPTIONS = [
  { id: "ALL", label: "All Time" },
  { id: "TODAY", label: "Today" },
  { id: "LAST_7_DAYS", label: "Last 7 Days" },
  { id: "LAST_30_DAYS", label: "Last 30 Days" },
  { id: "THIS_MONTH", label: "This Month" },
];

const MOVEMENT_TYPE_OPTIONS = [
  { id: "ALL", label: "All Types" },
  { id: "in", label: "Restock (In)" },
  { id: "out", label: "Usage / Waste (Out)" },
  { id: "adjustment", label: "Opname (Adjustment)" },
];

export const StockMovementPage: React.FC = () => {
  const [logs] = useState<StockLogItem[]>(() => getStoredStockLogs());
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<StockLogItem | null>(null);

  const handlePageChange = (newPage: number) => {
    setPrevPage(currentPage);
    setCurrentPage(newPage);
  };

  const slideClass = useMemo(() => {
    if (currentPage > prevPage) {
      return "animate-in fade-in-40 slide-in-from-right-6 duration-300 ease-out";
    }
    if (currentPage < prevPage) {
      return "animate-in fade-in-40 slide-in-from-left-6 duration-300 ease-out";
    }
    return "";
  }, [currentPage, prevPage]);

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_stock_movement_view_mode",
    "table",
  );

  const stats = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    let adjCount = 0;

    logs.forEach((log) => {
      if (log.type === "in") inCount += 1;
      else if (log.type === "out") outCount += 1;
      else if (log.type === "adjustment") adjCount += 1;
    });

    return {
      totalMovements: logs.length,
      inCount,
      outCount,
      adjCount,
    };
  }, [logs]);

  const isWithinDateRange = (
    createdAt: string,
    range: DateRangeFilter,
  ): boolean => {
    if (range === "ALL") return true;

    const logDate = new Date(createdAt);
    const now = new Date();

    if (range === "TODAY") {
      return (
        logDate.getDate() === now.getDate() &&
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      );
    }

    if (range === "LAST_7_DAYS") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= sevenDaysAgo;
    }

    if (range === "LAST_30_DAYS") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= thirtyDaysAgo;
    }

    if (range === "THIS_MONTH") {
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  };

  const filteredLogs = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return logs.filter((log) => {
      if (typeFilter !== "ALL" && log.type !== typeFilter) {
        return false;
      }

      if (!isWithinDateRange(log.created_at, dateFilter)) {
        return false;
      }

      if (query) {
        const matchName = log.product_name.toLowerCase().includes(query);
        const matchUser = log.user_name.toLowerCase().includes(query);
        const matchNote = log.note?.toLowerCase().includes(query);

        if (!matchName && !matchUser && !matchNote) {
          return false;
        }
      }

      return true;
    });
  }, [logs, deferredSearch, typeFilter, dateFilter]);

  const {
    sortedItems: sortedLogs,
    sortConfig,
    requestSort,
  } = useTableSort<StockLogItem>(filteredLogs, "created_at", "desc");

  const totalPages = Math.ceil(sortedLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedLogs.slice(startIndex, startIndex + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  const renderMovementType = (type: StockLogType) => {
    if (type === "in") {
      return (
        <Badge
          variant="outline"
          className="rounded-xl text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 shrink-0 shadow-2xs"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Restock</span>
        </Badge>
      );
    }
    if (type === "out") {
      return (
        <Badge
          variant="outline"
          className="rounded-xl text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 bg-destructive/10 text-destructive border-destructive/25 gap-1 shrink-0 shadow-2xs"
        >
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          <span>Usage</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="rounded-xl text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 shrink-0 shadow-2xs"
      >
        <ArrowDownUp className="w-3.5 h-3.5 shrink-0" />
        <span>Opname</span>
      </Badge>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Movements"
          value={`${stats.totalMovements} Events`}
          badgeText="All Time"
          badgeVariant="neutral"
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Restock Entries (In)"
          value={`${stats.inCount} Deliveries`}
          badgeText="Inflow"
          badgeVariant="success"
          icon={ArrowDownLeft}
        />
        <StatCard
          title="Usage & Waste (Out)"
          value={`${stats.outCount} Dispatches`}
          badgeText="Outflow"
          badgeVariant="danger"
          icon={ArrowUpRight}
        />
        <StatCard
          title="Opname Reconciliations"
          value={`${stats.adjCount} Audits`}
          badgeText="Audit Check"
          badgeVariant="neutral"
          icon={ArrowDownUp}
        />
      </StatGrid>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search material, note, or operator..."
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto min-w-0">
            <div className="flex-1 sm:flex-none min-w-0">
              <FormDropdownPicker
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
                options={MOVEMENT_TYPE_OPTIONS}
                icon={Filter}
                className="w-full sm:w-52"
              />
            </div>

            <div className="flex-1 sm:flex-none min-w-0">
              <FormDropdownPicker
                value={dateFilter}
                onChange={(val) => {
                  setDateFilter(val as DateRangeFilter);
                  setCurrentPage(1);
                }}
                options={DATE_RANGE_OPTIONS}
                icon={Calendar}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />
          </div>
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          "flex-1 min-w-0",
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {paginatedLogs.length === 0 ? (
          <EmptyState
            title="No stock movement logs found"
            description={
              searchQuery
                ? `No logs match "${searchQuery}".`
                : "No stock movement logs recorded matching the selected filter."
            }
          />
        ) : viewMode === "grid" ? (
          /* Grid Card View */
          <div className="space-y-4 pb-6">
            <div
              key={`grid-page-${currentPage}`}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4",
                slideClass,
              )}
            >
              {paginatedLogs.map((log) => (
                <Card
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
                            {log.product_name}
                          </h3>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          {renderMovementType(log.type)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Delta Change:
                          </span>
                          <div className="flex items-baseline gap-1 font-mono">
                            <span
                              className={cn(
                                "text-sm sm:text-base font-black tracking-tight",
                                log.type === "in"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : log.type === "out"
                                    ? "text-destructive"
                                    : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {log.type === "in"
                                ? `+${log.quantity.toLocaleString("id-ID")}`
                                : log.type === "out"
                                  ? `-${log.quantity.toLocaleString("id-ID")}`
                                  : `Set ${log.quantity.toLocaleString("id-ID")}`}
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {log.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs font-mono">
                          <span className="text-muted-foreground text-[11px] font-sans">
                            Balance:
                          </span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground/60 line-through text-[11px]">
                              {log.quantity_before.toLocaleString("id-ID")}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              →
                            </span>
                            <span className="font-extrabold text-foreground bg-card px-1.5 py-0.5 rounded-md border border-border/60 shadow-2xs text-xs">
                              {log.quantity_after.toLocaleString("id-ID")}{" "}
                              {log.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {log.note && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground min-w-0 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                          <span
                            className="text-xs text-muted-foreground line-clamp-1 font-medium flex-1"
                            title={log.note}
                          >
                            {log.note}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Date & Time
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate font-mono">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>

                      <div className="min-w-0 text-right">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Operator
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate">
                          {log.user_name}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sortedLogs.length > 0 && (
              <div className="flex justify-center pt-2 w-full">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedLogs.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="movement logs"
                    className="pt-0 pb-0"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="pb-6">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col justify-between overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Date & Time"
                          sortKey="created_at"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="whitespace-nowrap"
                        />
                        <SortableTh
                          label="Material Name"
                          sortKey="product_name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="pb-2.5 px-3 text-center whitespace-nowrap hidden md:table-cell">
                          Type
                        </th>
                        <SortableTh
                          label="Delta"
                          sortKey="quantity"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                        />
                        <th className="pb-2.5 px-3 text-right whitespace-nowrap">
                          Balance
                        </th>
                        <th className="pb-2.5 px-3 hidden md:table-cell">
                          Note
                        </th>
                        <th className="pb-2.5 px-3 hidden md:table-cell">
                          Operator
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      key={`table-page-${currentPage}`}
                      className={cn(
                        "divide-y divide-border/40 font-medium",
                        slideClass,
                      )}
                    >
                      {paginatedLogs.map((log) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-muted/40 transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <span className="font-semibold text-foreground text-xs">
                                {formatDate(log.created_at)}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {formatTime(log.created_at)}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="font-bold text-foreground block truncate text-xs sm:text-sm leading-tight">
                              {log.product_name}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap hidden md:table-cell">
                            <span
                              className={cn(
                                "text-xs font-bold",
                                log.type === "in"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : log.type === "out"
                                    ? "text-destructive"
                                    : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {log.type === "in"
                                ? "Restock"
                                : log.type === "out"
                                  ? "Usage"
                                  : "Opname"}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                            <span
                              className={cn(
                                "text-xs font-extrabold",
                                log.type === "in"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : log.type === "out"
                                    ? "text-destructive"
                                    : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {log.type === "in"
                                ? `+${log.quantity.toLocaleString("id-ID")}`
                                : log.type === "out"
                                  ? `-${log.quantity.toLocaleString("id-ID")}`
                                  : `Set ${log.quantity.toLocaleString("id-ID")}`}
                            </span>{" "}
                            <span className="text-muted-foreground text-[10px] font-medium">
                              {log.unit}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1 text-xs leading-tight">
                              <span className="text-muted-foreground/60 text-[10px] hidden sm:inline">
                                {log.quantity_before.toLocaleString("id-ID")} →
                              </span>
                              <span className="font-bold text-foreground">
                                {log.quantity_after.toLocaleString("id-ID")}
                              </span>
                              <span className="text-muted-foreground text-[10px]">
                                {log.unit}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 hidden md:table-cell max-w-28 lg:max-w-36">
                            <span
                              className="text-[11px] text-muted-foreground truncate block font-medium"
                              title={log.note || "-"}
                            >
                              {log.note || "-"}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 hidden md:table-cell whitespace-nowrap text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground truncate max-w-28">
                                {log.user_name}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sortedLogs.length > 0 && (
                  <div className="pt-3 mt-1 border-t border-border/60">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={sortedLogs.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        handlePageChange(1);
                      }}
                      pageSizeOptions={[10, 20, 50]}
                      itemLabel="movement logs"
                    />
                  </div>
                )}
              </Card>
            </div>

            <div className="sm:hidden space-y-3.5">
              <div
                key={`mobile-fallback-page-${currentPage}`}
                className={cn("grid grid-cols-1 gap-3.5", slideClass)}
              >
                {paginatedLogs.map((log) => (
                  <Card
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground p-4 space-y-3 cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-foreground text-xs sm:text-sm leading-snug truncate">
                            {log.product_name}
                          </h4>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          {renderMovementType(log.type)}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Delta Change:
                          </span>
                          <div className="flex items-baseline gap-1 font-mono">
                            <span
                              className={cn(
                                "text-sm sm:text-base font-black tracking-tight",
                                log.type === "in"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : log.type === "out"
                                    ? "text-destructive"
                                    : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {log.type === "in"
                                ? `+${log.quantity.toLocaleString("id-ID")}`
                                : log.type === "out"
                                  ? `-${log.quantity.toLocaleString("id-ID")}`
                                  : `Set ${log.quantity.toLocaleString("id-ID")}`}
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {log.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs font-mono">
                          <span className="text-muted-foreground text-[11px] font-sans">
                            Balance:
                          </span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground/60 line-through text-[11px]">
                              {log.quantity_before.toLocaleString("id-ID")}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              →
                            </span>
                            <span className="font-extrabold text-foreground bg-card px-1.5 py-0.5 rounded-md border border-border/60 shadow-2xs text-xs">
                              {log.quantity_after.toLocaleString("id-ID")}{" "}
                              {log.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {log.note && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground min-w-0 pt-0.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                          <span
                            className="text-xs text-muted-foreground line-clamp-1 font-medium flex-1"
                            title={log.note}
                          >
                            {log.note}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Date & Time
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate font-mono">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                      <div className="min-w-0 text-right">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Operator
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate">
                          {log.user_name}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {sortedLogs.length > 0 && (
                <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-4 py-2.5">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedLogs.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="movement logs"
                    className="pt-0 pb-0"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <StockMovementDetailDialog
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};

export default StockMovementPage;
