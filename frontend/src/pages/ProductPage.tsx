import React, { useState, useMemo } from "react";
import type { ProductItem } from "@/constants/cashier";
import { getStoredCategories } from "@/services/category";
import {
  getStoredProducts,
  addProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
} from "@/services/product";
import { ProductDialog } from "@/components/product/ProductDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Package,
  Store,
  Tags,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";

export const ProductPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(() =>
    getStoredProducts(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_product_view_mode",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(
    null,
  );
  const [restoringProduct, setRestoringProduct] = useState<ProductItem | null>(
    null,
  );

  const stats = useMemo(() => {
    const activeProducts = allProducts.filter((p) => !p.isDeleted);
    const total = activeProducts.length;
    const activeOnPos = activeProducts.filter(
      (p) => p.is_active !== false,
    ).length;
    const categoryCount = new Set(activeProducts.map((p) => p.category)).size;
    const archivedCount = allProducts.filter((p) => p.isDeleted).length;

    return { total, activeOnPos, categoryCount, archivedCount };
  }, [allProducts]);

  const productSharePercentages = useMemo(() => {
    let grandTotalPrice = 0;
    allProducts.forEach((p) => {
      if (!p.isDeleted) {
        grandTotalPrice += p.price;
      }
    });

    const percentages: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (!p.isDeleted) {
        percentages[p.id] =
          grandTotalPrice > 0
            ? Math.round((p.price / grandTotalPrice) * 100)
            : 0;
      }
    });

    return percentages;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    const targetList = allProducts.filter((p) =>
      showDeleted ? Boolean(p.isDeleted) : !p.isDeleted,
    );
    return targetList.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allProducts, showDeleted, searchQuery, selectedCategory]);

  const productsWithMetrics = useMemo(() => {
    return filteredProducts.map((p) => ({
      ...p,
      salesShare: productSharePercentages[p.id] || 0,
      posStatus: p.is_active !== false ? 1 : 0,
    }));
  }, [filteredProducts, productSharePercentages]);

  const {
    sortedItems: displayedProducts,
    sortConfig,
    requestSort,
  } = useTableSort(productsWithMetrics, "name", "asc");

  const categories = getStoredCategories(false, "product");
  const categoriesList = [
    { id: "all", label: "All Categories" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  const getCategoryLabel = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : catId;
  };

  const handleCreateOrUpdate = (
    data: Omit<ProductItem, "id"> | ProductItem,
  ) => {
    if ("id" in data && data.id) {
      const updated = updateProduct(data.id, data);
      if (updated) {
        setAllProducts(getStoredProducts(true));
        toast.success(`Product "${updated.name}" updated successfully!`);
      }
    } else {
      const created = addProduct({ ...data, is_active: true });
      setAllProducts(getStoredProducts(true));
      toast.success(`Product "${created.name}" added to catalog!`);
    }
  };

  const handleTogglePosStatus = (product: ProductItem) => {
    const currentStatus = product.is_active !== false;
    const newStatus = !currentStatus;
    const updated = updateProduct(product.id, { is_active: newStatus });
    if (updated) {
      setAllProducts(getStoredProducts(true));
      if (newStatus) {
        toast.success(`"${product.name}" is now Active on POS`);
      } else {
        toast.info(`"${product.name}" is now Off Menu (Hidden from POS)`);
      }
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = softDeleteProduct(id);
    if (success) {
      setAllProducts(getStoredProducts(true));
      toast.success("Product moved to trash");
    }
  };

  const handleRestoreConfirm = (id: string) => {
    const success = restoreProduct(id);
    if (success) {
      setAllProducts(getStoredProducts(true));
      toast.success("Product restored to active catalog");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      {/* 4 Stat Cards */}
      <StatGrid>
        <StatCard
          title="Total Menu Products"
          value={`${stats.total} Items`}
          icon={Package}
        />
        <StatCard
          title="Active on POS"
          value={`${stats.activeOnPos} Menu Ready`}
          badgeText="Ready to Sell"
          badgeVariant="success"
          icon={Store}
        />
        <StatCard
          title="Active Categories"
          value={`${stats.categoryCount} Categories`}
          badgeText="In Use"
          badgeVariant="neutral"
          icon={Tags}
        />
        <StatCard
          title="Trash / Archived"
          value={`${stats.archivedCount} Inactive`}
          badgeText={stats.archivedCount > 0 ? "Trash" : "Clean"}
          badgeVariant={stats.archivedCount > 0 ? "danger" : "neutral"}
          icon={Trash2}
        />
      </StatGrid>

      {/* Main Filter & Action Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        {/* Search Bar */}
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              showDeleted
                ? "Search deleted products..."
                : "Search product name or SKU..."
            }
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

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          {/* Category Dropdown Filter */}
          <div className="w-full sm:w-auto min-w-0">
            <DropdownMenu className="w-full sm:w-auto">
              <DropdownMenuTrigger className="w-full sm:w-auto">
                <button
                  type="button"
                  className="flex items-center justify-between gap-1.5 sm:gap-2 h-9.5 px-3 sm:px-3.5 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-auto shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate sm:whitespace-nowrap">
                      {selectedCategory === "all"
                        ? "All Categories"
                        : getCategoryLabel(selectedCategory)}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-56 sm:w-64 rounded-xl p-1 bg-card border border-border/80 shadow-md"
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

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
              className={cn(
                "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card justify-center shrink-0",
                showDeleted
                  ? "border-2 border-destructive text-destructive hover:border-destructive hover:bg-card shadow-xs font-bold"
                  : "border border-border/80 text-foreground hover:border-primary/80 hover:bg-card",
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeleted ? "Active Catalog" : "Trash"}</span>
              {stats.archivedCount > 0 && !showDeleted && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>

            {!showDeleted && (
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid vs Table View Content */}
      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {displayedProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            description={
              searchQuery
                ? `No products match "${searchQuery}".`
                : showDeleted
                  ? "No deleted products found in trash."
                  : "No products registered yet. Click 'Add Product' to get started."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
            {displayedProducts.map((p) => {
              const isPosActive = p.is_active !== false;

              return (
                <Card
                  key={p.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                            {p.name}
                          </h3>
                          <span className="text-xs text-muted-foreground block truncate">
                            {getCategoryLabel(p.category)}
                          </span>
                        </div>

                        {/* POS Status Badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 select-none",
                            isPosActive
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted/60 text-muted-foreground border border-border/40",
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isPosActive
                                ? "bg-emerald-500"
                                : "bg-muted-foreground/50",
                            )}
                          />
                          <span>
                            {isPosActive ? "Active on POS" : "Off Menu"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-muted-foreground text-xs font-medium">
                          Selling Price:
                        </span>
                        <span className="text-base font-extrabold text-foreground font-mono">
                          {formatRupiah(p.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Price Contribution
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          {p.salesShare}% of menu
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {p.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoringProduct(p)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                            title="Restore Product"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </Button>
                        ) : (
                          <>
                            {/* Quick POS Toggle Action Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTogglePosStatus(p)}
                              className={cn(
                                "h-8 w-8 rounded-lg transition-colors cursor-pointer",
                                isPosActive
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                              )}
                              title={
                                isPosActive
                                  ? "Click to hide from POS Cashier"
                                  : "Click to activate on POS Cashier"
                              }
                            >
                              <Store className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProduct(p);
                                setIsFormOpen(true);
                              }}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingProduct(p)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
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
                          onClick={() => requestSort("name")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Product Name</span>
                            {sortConfig?.key === "name" ? (
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
                          onClick={() => requestSort("price")}
                          className="pb-2.5 px-3 text-right cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Selling Price</span>
                            {sortConfig?.key === "price" ? (
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
                          onClick={() => requestSort("posStatus")}
                          className="pb-2.5 px-3 text-center cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>POS Status</span>
                            {sortConfig?.key === "posStatus" ? (
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
                          onClick={() => requestSort("salesShare")}
                          className="pb-2.5 px-3 text-right cursor-pointer select-none group hover:text-foreground transition-colors hidden lg:table-cell"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Price Share</span>
                            {sortConfig?.key === "salesShare" ? (
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
                      {displayedProducts.map((p) => {
                        const isPosActive = p.is_active !== false;

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-foreground block truncate text-xs sm:text-sm">
                                {p.name}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-muted-foreground font-medium hidden md:table-cell">
                              {getCategoryLabel(p.category)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                              {formatRupiah(p.price)}
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleTogglePosStatus(p)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer select-none",
                                  isPosActive
                                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                    : "text-muted-foreground bg-muted/60 hover:bg-muted",
                                )}
                                title={
                                  isPosActive
                                    ? "Click to hide from POS"
                                    : "Click to activate on POS"
                                }
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isPosActive
                                      ? "bg-emerald-500"
                                      : "bg-muted-foreground/50",
                                  )}
                                />
                                <span>
                                  {isPosActive ? "Active on POS" : "Off Menu"}
                                </span>
                              </button>
                            </td>

                            <td className="py-2.5 px-3 text-right hidden lg:table-cell whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-2">
                                <span className="font-bold text-xs">
                                  {p.salesShare}%
                                </span>
                                <div className="w-16 sm:w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.max(4, p.salesShare)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {p.isDeleted ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRestoringProduct(p)}
                                    className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                                    title="Restore Product"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </Button>
                                ) : (
                                  <>
                                    {/* Quick POS Toggle Action Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleTogglePosStatus(p)}
                                      className={cn(
                                        "h-8 w-8 rounded-lg transition-colors cursor-pointer",
                                        isPosActive
                                          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                      )}
                                      title={
                                        isPosActive
                                          ? "Click to hide from POS Cashier"
                                          : "Click to activate on POS Cashier"
                                      }
                                    >
                                      <Store className="w-3.5 h-3.5" />
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setIsFormOpen(true);
                                      }}
                                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      title="Edit Product"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeletingProduct(p)}
                                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      title="Move to Trash"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile View Cards */}
            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedProducts.map((p) => {
                const isPosActive = p.is_active !== false;

                return (
                  <Card
                    key={p.id}
                    className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground overflow-hidden flex flex-col justify-between select-none"
                  >
                    <CardContent className="p-3.5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                            {p.name}
                          </h3>
                          <span className="text-[10px] font-mono text-muted-foreground block truncate">
                            {getCategoryLabel(p.category)}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-0.5 rounded-full font-semibold shrink-0",
                            isPosActive
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted/60 text-muted-foreground border border-border/40",
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isPosActive
                                ? "bg-emerald-500"
                                : "bg-muted-foreground/50",
                            )}
                          />
                          <span>
                            {isPosActive ? "Active on POS" : "Off Menu"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-foreground font-mono">
                          {formatRupiah(p.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <span className="text-xs text-muted-foreground">
                          Share: {p.salesShare}%
                        </span>
                        <div className="flex items-center gap-1">
                          {p.isDeleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoringProduct(p)}
                              className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 text-xs font-semibold gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePosStatus(p)}
                                className={cn(
                                  "h-8 w-8 rounded-lg",
                                  isPosActive
                                    ? "text-emerald-600"
                                    : "text-muted-foreground",
                                )}
                                title={
                                  isPosActive ? "Hide from POS" : "Show on POS"
                                }
                              >
                                <Store className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsFormOpen(true);
                                }}
                                className="h-8 w-8 rounded-lg text-muted-foreground"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProduct(p)}
                                className="h-8 w-8 rounded-lg text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ProductDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSave={handleCreateOrUpdate}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            handleDeleteConfirm(deletingProduct.id);
            setDeletingProduct(null);
          }
        }}
        title="Move to Trash"
        subtitle={deletingProduct?.name}
        description={
          <span>
            Are you sure you want to move{" "}
            <strong>{deletingProduct?.name}</strong> to trash?
          </span>
        }
        confirmText="Move to Trash"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={Boolean(restoringProduct)}
        onClose={() => setRestoringProduct(null)}
        onConfirm={() => {
          if (restoringProduct) {
            handleRestoreConfirm(restoringProduct.id);
            setRestoringProduct(null);
          }
        }}
        title="Restore Product"
        subtitle={restoringProduct?.name}
        description={
          <span>
            Restore <strong>{restoringProduct?.name}</strong> back to active
            menu catalog?
          </span>
        }
        confirmText="Restore Menu"
        cancelText="Cancel"
        variant="success"
      />
    </div>
  );
};

export default ProductPage;
