import React, { useState, useMemo, useDeferredValue } from "react";
import type { StockItem, StockLogType } from "@/services/stock";
import {
  getStoredStocks,
  adjustStock,
  updateStockLimits,
} from "@/services/stock";
import { getStoredCategories } from "@/services/category";
import { StockAdjustmentDialog } from "@/components/stock/StockAdjustmentDialog";
import { StockLimitsDialog } from "@/components/stock/StockLimitsDialog";
import {
  StockGridCard,
  StockTableRow,
  StockMobileCard,
} from "@/components/stock/StockViewItems";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
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
  Boxes,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type StockStatusFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

type StockDialogState =
  | { type: "adjust"; item?: StockItem | null }
  | { type: "limits"; item: StockItem }
  | null;

export const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>(() => getStoredStocks());
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("ALL");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_stock_view_mode",
  );

  const [dialog, setDialog] = useState<StockDialogState>(null);

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

      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();
      return (
        item.product_name.toLowerCase().includes(q) ||
        item.category_name.toLowerCase().includes(q)
      );
    });
  }, [stocks, selectedCategory, statusFilter, deferredSearch]);

  const categoriesList = useMemo(() => {
    const stored = getStoredCategories(false, "ingredient").map((c) => ({
      id: c.id,
      label: c.name,
    }));
    return [{ id: "all", label: "All Categories" }, ...stored];
  }, []);

  const statusOptions = [
    { id: "ALL", label: "All Status" },
    { id: "IN_STOCK", label: "In Stock" },
    { id: "LOW_STOCK", label: "Low Stock" },
    { id: "OUT_OF_STOCK", label: "Out of Stock" },
  ];

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
        `${label} for "${result.stock.product_name}": ${formatNumber(result.stock.quantity)} ${result.stock.unit}`,
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
            placeholder="Search raw material name or category..."
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

        {/* Filters, Switchers & Actions */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          {/* Dropdown Filters - Full Width 2-columns on mobile & tablet (< lg) */}
          <div className="grid grid-cols-2 lg:flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto min-w-0">
            <div className="w-full lg:w-52 min-w-0">
              <FormDropdownPicker
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categoriesList}
                icon={Filter}
                className="w-full"
              />
            </div>

            {/* Status Dropdown on mobile & tablet (< lg) */}
            <div className="w-full lg:hidden min-w-0">
              <FormDropdownPicker
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as StockStatusFilter)}
                options={statusOptions}
                className="w-full"
              />
            </div>

            {/* Status Tabs on Desktop (>= lg) */}
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

          {/* Action Row: ViewModeSwitcher & Stock Adjustment together on the right */}
          <div className="flex items-center justify-end gap-2.5 w-full lg:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            <Button
              onClick={() => setDialog({ type: "adjust", item: null })}
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
            {displayedStocks.map((item) => (
              <StockGridCard
                key={item.id}
                item={item}
                formattedUpdatedAt={formatLastUpdated(item.updated_at)}
                renderStockBadge={renderStockBadge}
                onLimits={(stockItem) =>
                  setDialog({ type: "limits", item: stockItem })
                }
                onAdjust={(stockItem) =>
                  setDialog({ type: "adjust", item: stockItem })
                }
              />
            ))}
          </div>
        ) : (
          <div className="pb-6">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Material Name"
                          sortKey="product_name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="py-2.5 px-3 hidden md:table-cell">
                          Category
                        </th>
                        <SortableTh
                          label="Current Stock"
                          sortKey="quantity"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="py-2.5 px-3 text-center">
                          Stock Status
                        </th>
                        <SortableTh
                          label="Last Updated"
                          sortKey="updated_at"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="center"
                          className="hidden lg:table-cell"
                        />
                        <SortableTh
                          label="Asset Value"
                          sortKey="asset_value"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                        />
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedStocks.map((item) => (
                        <StockTableRow
                          key={item.id}
                          item={item}
                          formattedUpdatedAt={formatLastUpdated(item.updated_at)}
                          renderStockBadge={renderStockBadge}
                          onLimits={(stockItem) =>
                            setDialog({ type: "limits", item: stockItem })
                          }
                          onAdjust={(stockItem) =>
                            setDialog({ type: "adjust", item: stockItem })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedStocks.map((item) => (
                <StockMobileCard
                  key={item.id}
                  item={item}
                  formattedUpdatedAt={formatLastUpdated(item.updated_at)}
                  renderStockBadge={renderStockBadge}
                  onLimits={(stockItem) =>
                    setDialog({ type: "limits", item: stockItem })
                  }
                  onAdjust={(stockItem) =>
                    setDialog({ type: "adjust", item: stockItem })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <StockAdjustmentDialog
        isOpen={dialog?.type === "adjust"}
        onClose={() => setDialog(null)}
        stocks={stocks}
        initialStockItem={dialog?.type === "adjust" ? dialog.item : null}
        onConfirm={(payload) => {
          handleAdjustConfirm(payload);
          setDialog(null);
        }}
      />

      <StockLimitsDialog
        isOpen={dialog?.type === "limits"}
        onClose={() => setDialog(null)}
        stockItem={dialog?.type === "limits" ? dialog.item : null}
        onSave={(id, limits) => {
          handleLimitsConfirm(id, limits);
          setDialog(null);
        }}
      />
    </div>
  );
};

export default StockPage;
