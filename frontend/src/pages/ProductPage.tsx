import React, { useState, useMemo } from "react";
import type { ProductItem } from "@/constants/cashier";
import { CATEGORIES } from "@/constants/cashier";
import {
  getStoredProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "@/services/product";
import { ProductDialog } from "@/components/product/ProductDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
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
  LayoutGrid,
  List,
  Package,
  DollarSign,
  AlertTriangle,
  XCircle,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
} from "lucide-react";

export const ProductPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(() =>
    getStoredProducts(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    try {
      const saved = localStorage.getItem("sela_product_view_mode");
      return saved === "table" || saved === "grid" ? saved : "grid";
    } catch {
      return "grid";
    }
  });

  const [userSwitchedView, setUserSwitchedView] = useState(false);

  const handleViewModeChange = (mode: "grid" | "table") => {
    if (mode !== viewMode) {
      setUserSwitchedView(true);
      setViewMode(mode);
    }
    try {
      localStorage.setItem("sela_product_view_mode", mode);
    } catch {
      // Safe fallback for restricted storage environments
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "table") {
        setViewMode("grid");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

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
    const lowStock = activeProducts.filter(
      (p) => p.stock > 0 && p.stock < 6,
    ).length;
    const outOfStock = activeProducts.filter((p) => p.stock === 0).length;
    const totalValue = activeProducts.reduce(
      (sum, p) => sum + p.price * p.stock,
      0,
    );
    const archivedCount = allProducts.filter((p) => p.isDeleted).length;

    return { total, lowStock, outOfStock, totalValue, archivedCount };
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

  const handleCreateOrUpdate = (
    data: Omit<ProductItem, "id"> | ProductItem,
  ) => {
    if ("id" in data && data.id) {
      const updated = updateProduct(data.id, data);
      if (updated) {
        setAllProducts(getStoredProducts(true));
        toast.success("Product updated successfully!");
      }
    } else {
      addProduct(data);
      setAllProducts(getStoredProducts(true));
      toast.success("New product added successfully!");
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = deleteProduct(id);
    if (success) {
      setAllProducts(getStoredProducts(true));
      toast.success("Product moved to archive");
    }
  };

  const handleRestoreConfirm = (id: string) => {
    const success = restoreProduct(id);
    if (success) {
      setAllProducts(getStoredProducts(true));
      toast.success("Product restored successfully!");
    }
  };

  const getCategoryLabel = (catId: string) => {
    const found = CATEGORIES.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  const renderStockBadge = (stock: number, isTable = false) => {
    if (stock === 0) {
      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-bold shrink-0 bg-destructive/10 text-destructive border-destructive/25",
            isTable ? "text-[11px] px-2.5 py-0.5" : "text-[10px] px-2 py-0.5",
          )}
        >
          {isTable ? "Out of Stock" : "Out of Stock"}
        </Badge>
      );
    }
    if (stock < 6) {
      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-bold shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
            isTable ? "text-[11px] px-2.5 py-0.5" : "text-[10px] px-2 py-0.5",
          )}
        >
          {isTable ? `Low Stock (${stock} pcs)` : `Low: ${stock}`}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className={cn(
          "rounded-full shrink-0 font-medium",
          isTable ? "text-[11px] px-2.5 py-0.5" : "text-[10px] px-2 py-0.5",
        )}
      >
        {isTable ? `${stock} pcs` : `Stock: ${stock}`}
      </Badge>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      {/* Top Stat Cards Grid (Matching Dashboard & Cash Session layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Total Products"
          value={`${stats.total} Items`}
          icon={Package}
        />
        <StatCard
          title="Total Stock Value"
          value={formatRupiah(stats.totalValue)}
          icon={DollarSign}
        />
        <StatCard
          title="Low Stock (<6)"
          value={`${stats.lowStock} Products`}
          badgeText={stats.lowStock > 0 ? "Warning" : "Normal"}
          badgeVariant={stats.lowStock > 0 ? "danger" : "success"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Out of Stock"
          value={`${stats.outOfStock} Products`}
          badgeText={stats.outOfStock > 0 ? "Out" : "Available"}
          badgeVariant={stats.outOfStock > 0 ? "danger" : "success"}
          icon={XCircle}
        />
      </div>

      {/* Control Bar: Search, Filters, View Modes & Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                showDeleted
                  ? "Search archived menu or product name..."
                  : "Search menu or product name..."
              }
              className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80"
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

          {/* Category Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 h-9.5 px-3 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-medium transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary"
              >
                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate max-w-28 sm:max-w-40">
                  {getCategoryLabel(selectedCategory)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-52 rounded-xl p-1 bg-card border border-border/80 shadow-md"
            >
              {CATEGORIES.map((cat) => (
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

        {/* Right Actions: View Mode, Archive Toggle, Add Product */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* View Mode Switcher (hidden on mobile, defaults to grid) */}
          <div className="hidden sm:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 h-9.5">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Trash / Deleted List */}
          <Button
            variant="outline"
            onClick={() => setShowDeleted(!showDeleted)}
            className={cn(
              "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card",
              showDeleted
                ? "border-2 border-destructive text-destructive hover:border-destructive hover:bg-card shadow-xs font-bold"
                : "border border-border/80 text-foreground hover:border-primary/80 hover:bg-card",
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{showDeleted ? "Active Menu" : "Trash"}</span>
            {stats.archivedCount > 0 && !showDeleted && (
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            )}
          </Button>

          {/* Add Product Button */}
          {!showDeleted && (
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-dashed border-border/60">
            <p className="text-sm font-bold text-foreground">
              No products found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try selecting another category or clear your search term
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
            {filteredProducts.map((p) => (
              <Card
                key={p.id}
                className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
              >
                <CardContent className="p-3 sm:p-3.5 flex flex-col justify-between h-full space-y-2">
                  {/* Header: Product Name & Stock Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                    {renderStockBadge(p.stock, false)}
                  </div>

                  {/* Footer: Category, Price & Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                    <div className="min-w-0 flex-1">
                      <span className="text-muted-foreground font-medium text-[11px] block truncate capitalize">
                        {getCategoryLabel(p.category)}
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm text-foreground">
                        {formatRupiah(p.price)}
                      </span>
                    </div>

                    {/* Direct Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {p.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoringProduct(p)}
                          className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                          title="Restore Product"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </Button>
                      ) : (
                        <>
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
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* TABLE VIEW ON DESKTOP/TABLET, AUTO-GRID ON MOBILE */
          <>
            {/* Desktop & Tablet Table View */}
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <th className="pb-2.5 px-3">Product Name</th>
                        <th className="pb-2.5 px-3">Category</th>
                        <th className="pb-2.5 px-3 text-right">Price</th>
                        <th className="pb-2.5 px-3 text-center">
                          Stock Status
                        </th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {filteredProducts.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-foreground">
                            {p.name}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground capitalize">
                            {getCategoryLabel(p.category)}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-foreground">
                            {formatRupiah(p.price)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {renderStockBadge(p.stock, true)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {p.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRestoringProduct(p)}
                                  className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                                  title="Restore Product"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </Button>
                              ) : (
                                <>
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
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Auto Grid View */}
            <div className="sm:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 pb-6">
              {filteredProducts.map((p) => (
                <Card
                  key={p.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-3 sm:p-3.5 flex flex-col justify-between h-full space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
                        {p.name}
                      </h3>
                      {renderStockBadge(p.stock, false)}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[11px] block truncate capitalize">
                          {getCategoryLabel(p.category)}
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-foreground">
                          {formatRupiah(p.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {p.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoringProduct(p)}
                            className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                            title="Restore Product"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </Button>
                        ) : (
                          <>
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
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Form Dialog (Create / Edit) */}
      <ProductDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        title="Delete Product"
        subtitle="Confirm product deletion"
        description={
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{deletingProduct?.name}</strong>
            ? This product will be moved to the archive list.
          </p>
        }
        confirmText="Delete Product"
        variant="destructive"
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            handleDeleteConfirm(deletingProduct.id);
            setDeletingProduct(null);
          }
        }}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!restoringProduct}
        title="Restore Product?"
        subtitle="Confirm product restoration"
        description={
          <p>
            Product{" "}
            <strong className="text-foreground">
              {restoringProduct?.name}
            </strong>{" "}
            will be restored to active menu list.
          </p>
        }
        confirmText="Restore Product"
        variant="success"
        onClose={() => setRestoringProduct(null)}
        onConfirm={() => {
          if (restoringProduct) {
            handleRestoreConfirm(restoringProduct.id);
            setRestoringProduct(null);
          }
        }}
      />
    </div>
  );
};

export default ProductPage;
