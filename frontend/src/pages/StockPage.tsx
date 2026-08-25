import React, { useState, useMemo } from "react";
import type { StockItem, StockLogType } from "@/services/stock";
import {
  getStoredStocks,
  adjustStock,
  updateStockLimits,
} from "@/services/stock";
import { getStoredCategories } from "@/services/category";
import { StockAdjustmentDialog } from "@/components/stock/StockAdjustmentDialog";
import { StockLimitsDialog } from "@/components/stock/StockLimitsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRupiah } from "@/utils/formatCurrency";
import { formatLastUpdated } from "@/utils/formatDate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  DollarSign,
  AlertTriangle,
  XCircle,
  SlidersHorizontal,
  Filter,
  ChevronDown,
  Check,
  Settings2,
  Boxes,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";

type StockStatusFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>(() => getStoredStocks());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("ALL");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_stock_view_mode",
  );

  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedStockForAdjust, setSelectedStockForAdjust] =
    useState<StockItem | null>(null);

  const [isLimitsDialogOpen, setIsLimitsDialogOpen] = useState(false);
  const [selectedStockForLimits, setSelectedStockForLimits] =
    useState<StockItem | null>(null);

  const stats = useMemo(() => {
    const totalItems = stocks.reduce((acc, s) => acc + s.quantity, 0);
    const totalValuation = stocks.reduce(
      (acc, s) => acc + s.quantity * s.cost_price,
      0,
    );
    const lowStockCount = stocks.filter(
      (s) => s.quantity > 0 && s.quantity <= s.min_stock,
    ).length;
    const outOfStockCount = stocks.filter((s) => s.quantity === 0).length;

    return {
      totalItems,
      totalIngredients: stocks.length,
      totalValuation,
      lowStockCount,
      outOfStockCount,
    };
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      if (selectedCategory !== "all" && item.category_id !== selectedCategory) {
        return false;
      }

      if (statusFilter === "IN_STOCK") {
        if (item.quantity <= item.min_stock) return false;
      } else if (statusFilter === "LOW_STOCK") {
        if (item.quantity === 0 || item.quantity > item.min_stock) return false;
      } else if (statusFilter === "OUT_OF_STOCK") {
        if (item.quantity !== 0) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.product_name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category_name.toLowerCase().includes(q)
      );
    });
  }, [stocks, selectedCategory, statusFilter, searchQuery]);

  const categoriesList = useMemo(() => {
    const stored = getStoredCategories(false, "ingredient").map((c) => ({
      id: c.id,
      label: c.name,
    }));
    return [{ id: "all", label: "All Categories" }, ...stored];
  }, []);

  const stocksWithMetrics = useMemo(() => {
    return filteredStocks.map((s) => ({
      ...s,
      asset_value: s.quantity * s.cost_price,
    }));
  }, [filteredStocks]);

  const {
    sortedItems: displayedStocks,
    sortConfig,
    requestSort,
  } = useTableSort(stocksWithMetrics, "product_name", "asc");

  const handleAdjustConfirm = (payload: {
    product_id: string;
    type: StockLogType;
    quantity: number;
    note?: string;
  }) => {
    const result = adjustStock(payload);
    if (result) {
      setStocks(getStoredStocks());
      const label =
        payload.type === "in"
          ? "Restocked"
          : payload.type === "out"
            ? "Stock Reduced"
            : "Stock Adjusted";
      toast.success(
        `${label} for "${result.stock.product_name}": ${result.stock.quantity.toLocaleString("id-ID")} ${result.stock.unit}`,
      );
    }
  };

  const handleLimitsConfirm = (
    ingredientId: string,
    limits: { min_stock: number; max_stock: number },
  ) => {
    const updated = updateStockLimits(ingredientId, limits);
    if (updated) {
      setStocks(getStoredStocks());
      toast.success(`Alert limits updated for "${updated.product_name}"`);
    }
  };

  const renderStockBadge = (stock: StockItem, isTable = false) => {
    if (isTable) {
      if (stock.quantity === 0) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            <span>Out of Stock</span>
          </span>
        );
      }
      if (stock.quantity <= stock.min_stock) {
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span>Low Stock</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>In Stock</span>
        </span>
      );
    }

    if (stock.quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-0.5 rounded-full font-bold shrink-0 bg-destructive/10 text-destructive border border-destructive/25 whitespace-nowrap select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
          <span>Out of Stock</span>
        </span>
      );
    }
    if (stock.quantity <= stock.min_stock) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-0.5 rounded-full font-bold shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
          <span>Low Stock</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap select-none pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        <span>In Stock</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Raw Materials Tracked"
          value={`${stats.totalIngredients} Items`}
          icon={Boxes}
        />
        <StatCard
          title="Total Asset Valuation"
          value={formatRupiah(stats.totalValuation)}
          badgeText="Cost basis"
          badgeVariant="success"
          icon={DollarSign}
        />
        <StatCard
          title="Low Stock (< Min)"
          value={`${stats.lowStockCount} Materials`}
          badgeText={stats.lowStockCount > 0 ? "Warning" : "Healthy"}
          badgeVariant={stats.lowStockCount > 0 ? "danger" : "success"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Out of Stock"
          value={`${stats.outOfStockCount} Materials`}
          badgeText={stats.outOfStockCount > 0 ? "Out" : "Available"}
          badgeVariant={stats.outOfStockCount > 0 ? "danger" : "success"}
          icon={XCircle}
        />
      </StatGrid>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw material name, SKU, or category..."
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
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
              <DropdownMenu className="w-full sm:w-auto">
                <DropdownMenuTrigger className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="flex items-center justify-between gap-1.5 sm:gap-2 h-9.5 px-3 sm:px-3.5 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-auto shadow-2xs min-w-0"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate sm:whitespace-nowrap">
                        {categoriesList.find((c) => c.id === selectedCategory)
                          ?.label || "All Categories"}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-52 rounded-xl p-1 bg-card border border-border/80 shadow-md"
                >
                  {categoriesList.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center justify-between py-2 px-2.5 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                        selectedCategory === cat.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 sm:flex-none min-w-0 lg:hidden">
              <DropdownMenu className="w-full sm:w-auto">
                <DropdownMenuTrigger className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="flex items-center justify-between gap-1.5 sm:gap-2 h-9.5 px-3 sm:px-3.5 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-auto shadow-2xs min-w-0"
                  >
                    <span className="truncate sm:whitespace-nowrap">
                      {statusFilter === "ALL"
                        ? "All Status"
                        : statusFilter === "IN_STOCK"
                          ? "In Stock"
                          : statusFilter === "LOW_STOCK"
                            ? "Low Stock"
                            : "Out of Stock"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-44 rounded-xl p-1 bg-card border border-border/80 shadow-md"
                >
                  {[
                    { id: "ALL", label: "All Status" },
                    { id: "IN_STOCK", label: "In Stock" },
                    { id: "LOW_STOCK", label: "Low Stock" },
                    { id: "OUT_OF_STOCK", label: "Out of Stock" },
                  ].map((tab) => (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as StockStatusFilter)}
                      className={cn(
                        "flex items-center justify-between py-2 px-2.5 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                        statusFilter === tab.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span>{tab.label}</span>
                      {statusFilter === tab.id && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden lg:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs h-9.5 shrink-0">
              {(
                [
                  { id: "ALL", label: "All" },
                  { id: "IN_STOCK", label: "In Stock" },
                  { id: "LOW_STOCK", label: "Low Stock" },
                  { id: "OUT_OF_STOCK", label: "Out" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "px-2.5 sm:px-3 h-7.5 rounded-lg font-semibold transition-all cursor-pointer select-none text-[11px] sm:text-xs whitespace-nowrap",
                    statusFilter === tab.id
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            <Button
              onClick={() => {
                setSelectedStockForAdjust(null);
                setIsAdjustDialogOpen(true);
              }}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Stock Adjustment</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {displayedStocks.length === 0 ? (
          <EmptyState
            title="No raw material stocks found"
            description={
              searchQuery
                ? `No stock items match "${searchQuery}".`
                : "No raw material stock items matching the current filter."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
            {displayedStocks.map((item) => {
              const percentage = Math.min(
                100,
                Math.round((item.quantity / (item.max_stock || 100)) * 100),
              );
              const isLow =
                item.quantity > 0 && item.quantity <= item.min_stock;
              const isOut = item.quantity === 0;

              return (
                <Card
                  key={item.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                            {item.product_name}
                          </h3>
                          <span className="text-xs text-muted-foreground block truncate">
                            {item.category_name}
                          </span>
                        </div>
                        {renderStockBadge(item, false)}
                      </div>

                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-muted-foreground font-medium text-xs">
                            Current Stock:
                          </span>
                          <span className="font-extrabold text-foreground text-sm font-mono">
                            {item.quantity.toLocaleString("id-ID")}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              / {item.max_stock.toLocaleString("id-ID")}{" "}
                              {item.unit}
                            </span>
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isOut
                                ? "bg-destructive w-0"
                                : isLow
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                            style={{ width: `${Math.max(4, percentage)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                          <span>
                            Min Alert:{" "}
                            <span className="font-semibold text-foreground">
                              {item.min_stock.toLocaleString("id-ID")}{" "}
                              {item.unit}
                            </span>
                          </span>
                          <span>
                            Valuation:{" "}
                            <span className="font-semibold text-foreground font-mono">
                              {formatRupiah(item.asset_value)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Last Updated
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate">
                          {formatLastUpdated(item.updated_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStockForLimits(item);
                            setIsLimitsDialogOpen(true);
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                          title="Set Alert Thresholds"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStockForAdjust(item);
                            setIsAdjustDialogOpen(true);
                          }}
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
                          title="Adjust Stock"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Adjust</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="pb-6">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <th
                          onClick={() => requestSort("product_name")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Material Name</span>
                            {sortConfig?.key === "product_name" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th className="pb-2.5 px-3 hidden md:table-cell">
                          Category
                        </th>
                        <th
                          onClick={() => requestSort("quantity")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Current Stock</span>
                            {sortConfig?.key === "quantity" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th className="pb-2.5 px-3 text-center">
                          Stock Status
                        </th>
                        <th
                          onClick={() => requestSort("updated_at")}
                          className="pb-2.5 px-3 text-center cursor-pointer select-none group hover:text-foreground transition-colors hidden lg:table-cell"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Last Updated</span>
                            {sortConfig?.key === "updated_at" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => requestSort("asset_value")}
                          className="pb-2.5 px-3 text-right cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Asset Value</span>
                            {sortConfig?.key === "asset_value" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedStocks.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-foreground block truncate text-xs sm:text-sm">
                              {item.product_name}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground font-medium hidden md:table-cell">
                            {item.category_name}
                          </td>

                          <td className="py-2.5 px-3 font-mono text-foreground font-semibold whitespace-nowrap">
                            <span className="font-bold">
                              {item.quantity.toLocaleString("id-ID")}
                            </span>{" "}
                            <span className="text-[11px] font-normal text-muted-foreground">
                              {item.unit}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {renderStockBadge(item, true)}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-muted-foreground text-xs hidden lg:table-cell">
                            {formatLastUpdated(item.updated_at)}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-foreground font-semibold whitespace-nowrap">
                            {formatRupiah(item.asset_value)}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedStockForLimits(item);
                                  setIsLimitsDialogOpen(true);
                                }}
                                className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                                title="Set Alert Thresholds"
                              >
                                <Settings2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStockForAdjust(item);
                                  setIsAdjustDialogOpen(true);
                                }}
                                className="h-7.5 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
                                title="Adjust Stock"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                <span>Adjust</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedStocks.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs space-y-2.5"
                >
                  <CardContent className="p-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                          {item.product_name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {item.category_name}
                        </span>
                      </div>
                      {renderStockBadge(item, false)}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground text-xs">
                          Current Stock:
                        </span>
                        <span className="font-bold text-foreground font-mono text-sm">
                          {item.quantity.toLocaleString("id-ID")} {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          Min Alert: {item.min_stock.toLocaleString("id-ID")}{" "}
                          {item.unit}
                        </span>
                        <span>Valuation: {formatRupiah(item.asset_value)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Last Updated
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate">
                          {formatLastUpdated(item.updated_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStockForLimits(item);
                            setIsLimitsDialogOpen(true);
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStockForAdjust(item);
                            setIsAdjustDialogOpen(true);
                          }}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 text-primary border-primary/40 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Adjust</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <StockAdjustmentDialog
        isOpen={isAdjustDialogOpen}
        onClose={() => {
          setIsAdjustDialogOpen(false);
          setSelectedStockForAdjust(null);
        }}
        stocks={stocks}
        initialStockItem={selectedStockForAdjust}
        onConfirm={handleAdjustConfirm}
      />

      <StockLimitsDialog
        isOpen={isLimitsDialogOpen}
        onClose={() => {
          setIsLimitsDialogOpen(false);
          setSelectedStockForLimits(null);
        }}
        stockItem={selectedStockForLimits}
        onSave={handleLimitsConfirm}
      />
    </div>
  );
};

export default StockPage;
