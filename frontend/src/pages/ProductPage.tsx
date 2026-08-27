import React, { useState, useMemo, useDeferredValue } from "react";
import { getStoredCategories } from "@/services/category";
import {
  getStoredProducts,
  addProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  type ProductItem,
} from "@/services/product";
import { ProductDialog } from "@/components/product/ProductDialog";
import {
  ProductGridCard,
  ProductTableRow,
  ProductMobileCard,
} from "@/components/product/ProductViewItems";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Trash2,
  Package,
  Store,
  Tags,
  Filter,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type ProductDialogState =
  | { type: "create" }
  | { type: "edit"; product: ProductItem }
  | { type: "delete"; product: ProductItem }
  | { type: "restore"; product: ProductItem }
  | null;

export const ProductPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<ProductItem[]>(() =>
    getStoredProducts(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_product_view_mode",
  );

  const [dialog, setDialog] = useState<ProductDialogState>(null);

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
        .includes(deferredSearch.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allProducts, showDeleted, deferredSearch, selectedCategory]);

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

  const categories = useMemo(
    () => getStoredCategories(false, "product"),
    [],
  );

  const categoriesList = useMemo(
    () => [
      { id: "all", label: "All Categories" },
      ...categories.map((c) => ({ id: c.id, label: c.name })),
    ],
    [categories],
  );

  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const getCategoryLabel = (catId: string) => {
    return categoriesMap.get(catId) || catId;
  };

  const handleCreateOrUpdate = (
    data: Omit<ProductItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
  ) => {
    if (dialog?.type === "edit") {
      const updated = updateProduct(dialog.product.id, data);
      if (updated) {
        setAllProducts(getStoredProducts(true));
        toast.success(`Product "${updated.name}" updated successfully!`);
      }
    } else {
      const created = addProduct(data);
      setAllProducts(getStoredProducts(true));
      toast.success(`Product "${created.name}" created successfully!`);
    }
  };

  const handleTogglePosStatus = (product: ProductItem) => {
    const newStatus = product.is_active === false ? true : false;
    const updated = updateProduct(product.id, {
      ...product,
      is_active: newStatus,
    });
    if (updated) {
      setAllProducts(getStoredProducts(true));
      toast.success(
        `Product "${updated.name}" is now ${newStatus ? "ACTIVE" : "HIDDEN"} on POS`,
      );
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

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              showDeleted
                ? "Search deleted products..."
                : "Search product name..."
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

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          
          <div className="w-full sm:w-auto min-w-0">
            <FormDropdownPicker
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoriesList}
              icon={Filter}
              className="w-full sm:w-56"
            />
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
                onClick={() => setDialog({ type: "create" })}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {displayedProducts.length === 0 ? (
          <EmptyState
            title="No menu products found"
            description={
              searchQuery
                ? `No products match "${searchQuery}".`
                : showDeleted
                  ? "Archived products trash is currently empty."
                  : "No products added yet. Click 'Add Product' to create your menu items."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
            {displayedProducts.map((p) => (
              <ProductGridCard
                key={p.id}
                product={p}
                categoryLabel={getCategoryLabel(p.category)}
                onTogglePos={handleTogglePosStatus}
                onEdit={(product) => setDialog({ type: "edit", product })}
                onDelete={(product) => setDialog({ type: "delete", product })}
                onRestore={(product) => setDialog({ type: "restore", product })}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Product Name"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="py-2.5 px-3 hidden md:table-cell">
                          Category
                        </th>
                        <SortableTh
                          label="Selling Price"
                          sortKey="price"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                        />
                        <SortableTh
                          label="POS Ready"
                          sortKey="posStatus"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="center"
                        />
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedProducts.map((p) => (
                        <ProductTableRow
                          key={p.id}
                          product={p}
                          categoryLabel={getCategoryLabel(p.category)}
                          onTogglePos={handleTogglePosStatus}
                          onEdit={(product) =>
                            setDialog({ type: "edit", product })
                          }
                          onDelete={(product) =>
                            setDialog({ type: "delete", product })
                          }
                          onRestore={(product) =>
                            setDialog({ type: "restore", product })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedProducts.map((p) => (
                <ProductMobileCard
                  key={p.id}
                  product={p}
                  categoryLabel={getCategoryLabel(p.category)}
                  onTogglePos={handleTogglePosStatus}
                  onEdit={(product) => setDialog({ type: "edit", product })}
                  onDelete={(product) =>
                    setDialog({ type: "delete", product })
                  }
                  onRestore={(product) =>
                    setDialog({ type: "restore", product })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ProductDialog
        isOpen={dialog?.type === "create" || dialog?.type === "edit"}
        onClose={() => setDialog(null)}
        initialData={dialog?.type === "edit" ? dialog.product : null}
        onSave={(data) => {
          handleCreateOrUpdate(data);
          setDialog(null);
        }}
      />

      <ConfirmDialog
        isOpen={dialog?.type === "delete" || dialog?.type === "restore"}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.type === "delete") {
            handleDeleteConfirm(dialog.product.id);
          } else if (dialog?.type === "restore") {
            handleRestoreConfirm(dialog.product.id);
          }
          setDialog(null);
        }}
        title={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Product"
        }
        subtitle={
          dialog?.type === "delete" || dialog?.type === "restore"
            ? dialog.product.name
            : undefined
        }
        description={
          dialog?.type === "delete" ? (
            <span>
              Are you sure you want to move{" "}
              <strong>{dialog.product.name}</strong> to trash?
            </span>
          ) : (
            <span>
              Restore <strong>{dialog?.type === "restore" ? dialog.product.name : ""}</strong> back to active
              menu catalog?
            </span>
          )
        }
        confirmText={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Menu"
        }
        cancelText="Cancel"
        variant={dialog?.type === "delete" ? "destructive" : "success"}
      />
    </div>
  );
};

export default ProductPage;
