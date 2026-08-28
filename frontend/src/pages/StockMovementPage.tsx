import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import type { StockLogItem, StockLogType } from "@/services/stock";
import { getStoredStockLogs } from "@/services/stock";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { SortableTh } from "@/components/shared/SortableTh";
import { Pagination } from "@/components/shared/Pagination";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { StockMovementDetailDialog } from "@/components/stock-movement/StockMovementDetailDialog";
import {
  StockMovementGridCard,
  StockMovementTableRow,
  StockMovementMobileCard,
} from "@/components/stock-movement/StockMovementViewItems";
import {
  type DateRangeFilter,
  DATE_RANGE_OPTIONS,
  isWithinDateRange,
} from "@/utils/formatDate";

const MOVEMENT_TYPE_OPTIONS = [
  { id: "ALL", label: "All Types" },
  { id: "in", label: "Restock (In)" },
  { id: "out", label: "Usage / Waste (Out)" },
  { id: "adjustment", label: "Opname (Adjustment)" },
];

export const StockMovementPage: React.FC = () => {
  const [logs, setLogs] = useState<StockLogItem[]>(() => getStoredStockLogs());
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    const sync = () => {
      setLogs(getStoredStockLogs());
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

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

  const renderMovementType = (type: StockLogType, isTable = false) => {
    if (isTable) {
      if (type === "in") {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Restock</span>
          </span>
        );
      }
      if (type === "out") {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive whitespace-nowrap">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>Usage</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
          <ArrowDownUp className="w-3.5 h-3.5 shrink-0" />
          <span>Opname</span>
        </span>
      );
    }

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
        variant="secondary"
        className="rounded-xl text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 bg-muted text-muted-foreground border border-border/60 gap-1 shrink-0 shadow-2xs"
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
          badgeText="Audit"
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
          <div className="space-y-4 pb-6">
            <div
              key={`grid-page-${currentPage}`}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4",
                slideClass,
              )}
            >
              {paginatedLogs.map((log) => (
                <StockMovementGridCard
                  key={log.id}
                  log={log}
                  renderMovementType={renderMovementType}
                  onSelect={setSelectedLog}
                />
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
          <div className="pb-6">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col justify-between overflow-hidden mb-6">
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
                        <th className="py-2.5 px-3 text-center whitespace-nowrap hidden lg:table-cell">
                          Type
                        </th>
                        <SortableTh
                          label="Delta"
                          sortKey="quantity"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                        />
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">
                          Balance
                        </th>
                        <th className="py-2.5 px-3 hidden md:table-cell">
                          Operator
                        </th>
                        <th className="py-2.5 px-3 hidden xl:table-cell">
                          Note
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
                        <StockMovementTableRow
                          key={log.id}
                          log={log}
                          renderMovementType={renderMovementType}
                          onSelect={setSelectedLog}
                        />
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
                  <StockMovementMobileCard
                    key={log.id}
                    log={log}
                    renderMovementType={renderMovementType}
                    onSelect={setSelectedLog}
                  />
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
