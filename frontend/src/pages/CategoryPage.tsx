import React, { useState, useMemo, useDeferredValue } from "react";
import type { CategoryItem, CategoryType } from "@/services/category";
import {
  getStoredCategories,
  addCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
} from "@/services/category";
import { getStoredProducts } from "@/services/product";
import { getStoredIngredients } from "@/services/ingredient";
import { CategoryDialog } from "@/components/category/CategoryDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  FolderTree,
  Package,
  FolderOpen,
  RotateCcw,
  Wheat,
  ChevronDown,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type CategoryDialogState =
  | { type: "create" }
  | { type: "edit"; category: CategoryItem }
  | { type: "delete"; category: CategoryItem }
  | { type: "restore"; category: CategoryItem }
  | null;

export const CategoryPage: React.FC = () => {
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(() =>
    getStoredCategories(true),
  );
  const [activeTab, setActiveTab] = useState<CategoryType>("product");
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const products = useMemo(() => getStoredProducts(), []);
  const ingredients = useMemo(() => getStoredIngredients(), []);

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_category_view_mode",
  );

  const [dialog, setDialog] = useState<CategoryDialogState>(null);

  const productCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const ingredientCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ingredients.forEach((ing) => {
      counts[ing.category] = (counts[ing.category] || 0) + 1;
    });
    return counts;
  }, [ingredients]);

  const tabCounts = useMemo(() => {
    const activeCats = allCategories.filter((c) => !c.isDeleted);
    const productCount = activeCats.filter(
      (c) => (c.type || "product") === "product",
    ).length;
    const ingredientCount = activeCats.filter(
      (c) => c.type === "ingredient",
    ).length;
    return { productCount, ingredientCount };
  }, [allCategories]);

  const stats = useMemo(() => {
    const currentTabCategories = allCategories.filter(
      (c) => (c.type || "product") === activeTab,
    );
    const activeCategories = currentTabCategories.filter((c) => !c.isDeleted);
    const deletedCategories = currentTabCategories.filter((c) => c.isDeleted);

    const total = activeCategories.length;
    const countsMap =
      activeTab === "product"
        ? productCategoryCounts
        : ingredientCategoryCounts;

    const activeCount = activeCategories.filter(
      (c) => (countsMap[c.id] || 0) > 0,
    ).length;
    const emptyCount = total - activeCount;
    const archivedCount = deletedCategories.length;

    return {
      total,
      activeCount,
      emptyCount,
      archivedCount,
    };
  }, [
    allCategories,
    activeTab,
    productCategoryCounts,
    ingredientCategoryCounts,
  ]);

  const filteredCategories = useMemo(() => {
    const targetList = allCategories.filter((c) => {
      const matchType = (c.type || "product") === activeTab;
      const matchDeleted = showDeleted ? Boolean(c.isDeleted) : !c.isDeleted;
      return matchType && matchDeleted;
    });

    return targetList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (c.description &&
          c.description.toLowerCase().includes(deferredSearch.toLowerCase()));
      return matchSearch;
    });
  }, [allCategories, activeTab, showDeleted, deferredSearch]);

  const categoriesWithMetrics = useMemo(() => {
    const countsMap =
      activeTab === "product"
        ? productCategoryCounts
        : ingredientCategoryCounts;

    return filteredCategories.map((c) => ({
      ...c,
      itemCount: countsMap[c.id] || 0,
    }));
  }, [
    filteredCategories,
    activeTab,
    productCategoryCounts,
    ingredientCategoryCounts,
  ]);

  const {
    sortedItems: displayedCategories,
    sortConfig,
    requestSort,
  } = useTableSort(categoriesWithMetrics, "name", "asc");

  const handleCreateOrUpdate = (
    data: Omit<CategoryItem, "id"> | CategoryItem,
  ) => {
    if ("id" in data && data.id) {
      const updated = updateCategory(data.id, data);
      if (updated) {
        setAllCategories(getStoredCategories(true));
        toast.success(`Category "${updated.name}" updated successfully!`);
      }
    } else {
      const created = addCategory({ ...data, type: activeTab });
      setAllCategories(getStoredCategories(true));
      toast.success(`Category "${created.name}" added successfully!`);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = softDeleteCategory(id);
    if (success) {
      setAllCategories(getStoredCategories(true));
      toast.success("Category moved to trash");
    }
  };

  const handleRestoreConfirm = (id: string) => {
    const success = restoreCategory(id);
    if (success) {
      setAllCategories(getStoredCategories(true));
      toast.success("Category restored to active list");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title={
            activeTab === "product"
              ? "Total Product Categories"
              : "Total Ingredient Categories"
          }
          value={`${stats.total} Categories`}
          icon={activeTab === "product" ? FolderTree : Wheat}
        />
        <StatCard
          title="Active Categories"
          value={`${stats.activeCount} In Use`}
          badgeText="Has Items"
          badgeVariant="success"
          icon={Package}
        />
        <StatCard
          title="Empty Categories"
          value={`${stats.emptyCount} Empty`}
          badgeText={stats.emptyCount > 0 ? "Unused" : "All Used"}
          badgeVariant={stats.emptyCount > 0 ? "neutral" : "success"}
          icon={FolderOpen}
        />
        <StatCard
          title="Trash / Archived"
          value={`${stats.archivedCount} Items`}
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
              activeTab === "product"
                ? "Search product category name or description..."
                : "Search ingredient category name or description..."
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
          <div className="w-full sm:w-auto min-w-0 lg:hidden">
            <DropdownMenu className="w-full sm:w-auto">
              <DropdownMenuTrigger className="w-full sm:w-auto">
                <button
                  type="button"
                  className="flex items-center justify-between gap-2 h-9.5 px-3 sm:px-3.5 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-auto shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {activeTab === "product" ? (
                      <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <Wheat className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <span className="truncate sm:whitespace-nowrap font-semibold text-xs">
                      {activeTab === "product"
                        ? "Menu Products"
                        : "Raw Ingredients"}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary leading-none">
                      {activeTab === "product"
                        ? tabCounts.productCount
                        : tabCounts.ingredientCount}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 rounded-xl p-1 bg-card border border-border/80 shadow-md"
              >
                <DropdownMenuItem
                  onClick={() => setActiveTab("product")}
                  className={cn(
                    "flex items-center justify-between py-2 px-2.5 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                    activeTab === "product"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Menu Products</span>
                  </div>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none",
                      activeTab === "product"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCounts.productCount}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveTab("ingredient")}
                  className={cn(
                    "flex items-center justify-between py-2 px-2.5 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                    activeTab === "ingredient"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Wheat className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Raw Ingredients</span>
                  </div>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none",
                      activeTab === "ingredient"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCounts.ingredientCount}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden lg:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs h-9.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("product")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 h-7.5 rounded-lg font-semibold transition-all cursor-pointer select-none text-xs",
                activeTab === "product"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>Menu Products</span>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums ml-0.5",
                  activeTab === "product"
                    ? "text-primary font-bold"
                    : "text-muted-foreground",
                )}
              >
                {tabCounts.productCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ingredient")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 h-7.5 rounded-lg font-semibold transition-all cursor-pointer select-none text-xs",
                activeTab === "ingredient"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Wheat className="w-3.5 h-3.5 shrink-0" />
              <span>Raw Ingredients</span>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums ml-0.5",
                  activeTab === "ingredient"
                    ? "text-primary font-bold"
                    : "text-muted-foreground",
                )}
              >
                {tabCounts.ingredientCount}
              </span>
            </button>
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
              <span>{showDeleted ? "Active Categories" : "Trash"}</span>
              {stats.archivedCount > 0 && !showDeleted && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>

            {!showDeleted && (
              <Button
                onClick={() => setDialog({ type: "create" })}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === "product"
                    ? "Add Menu Category"
                    : "Add Material Category"}
                </span>
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
        {displayedCategories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description={
              searchQuery
                ? `No category matches "${searchQuery}".`
                : showDeleted
                  ? "Archived categories trash is currently empty."
                  : "No categories added yet. Click 'Add Category' to organize your items."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 pb-6">
            {displayedCategories.map((c) => {
              const count = c.itemCount;
              return (
                <Card
                  key={c.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {activeTab === "product" ? (
                              <FolderTree className="w-4 h-4" />
                            ) : (
                              <Wheat className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                              {c.name}
                            </h3>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                              {c.id}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 border-0",
                            count > 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {count > 0 ? `${count} items` : "Empty"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                      <div className="flex items-center gap-1 shrink-0">
                        {c.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDialog({ type: "restore", category: c })}
                            className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                            title="Restore Category"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDialog({ type: "edit", category: c })}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDialog({ type: "delete", category: c })}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete Category"
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
          <div className="space-y-4">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Category Name"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="pb-2.5 px-3">Description</th>
                        <SortableTh
                          label={
                            activeTab === "product"
                              ? "Products Count"
                              : "Materials Count"
                          }
                          sortKey="itemCount"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="text-center"
                        />
                        <th className="pb-2.5 px-3 text-center">Status</th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedCategories.map((c) => {
                        const count = c.itemCount;
                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  {activeTab === "product" ? (
                                    <FolderTree className="w-3.5 h-3.5" />
                                  ) : (
                                    <Wheat className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <span>{c.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">
                              {c.description || "-"}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold font-mono">
                              {count}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    count > 0
                                      ? "bg-emerald-500"
                                      : "bg-muted-foreground/50",
                                  )}
                                />
                                <span
                                  className={
                                    count > 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {count > 0 ? "In Use" : "Empty"}
                                </span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {c.isDeleted ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDialog({ type: "restore", category: c })}
                                    className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                                    title="Restore Category"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Restore</span>
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDialog({ type: "edit", category: c })}
                                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      title="Edit Category"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDialog({ type: "delete", category: c })}
                                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      title="Delete Category"
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

            <div className="grid grid-cols-1 gap-3 sm:hidden pt-1 pb-6">
              {displayedCategories.map((c) => {
                const count = c.itemCount;
                return (
                  <Card
                    key={c.id}
                    className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3"
                  >
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {activeTab === "product" ? (
                              <FolderOpen className="w-4 h-4" />
                            ) : (
                              <Wheat className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground leading-tight truncate">
                              {c.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              {count}{" "}
                              {activeTab === "product"
                                ? "products"
                                : "materials"}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-lg border-0 shrink-0",
                            count > 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {count > 0 ? "In Use" : "Empty"}
                        </Badge>
                      </div>

                      {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                        {c.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDialog({ type: "restore", category: c })}
                            className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDialog({ type: "edit", category: c })}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDialog({ type: "delete", category: c })}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CategoryDialog
        isOpen={dialog?.type === "create" || dialog?.type === "edit"}
        onClose={() => setDialog(null)}
        initialData={dialog?.type === "edit" ? dialog.category : null}
        categoryType={activeTab}
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
            handleDeleteConfirm(dialog.category.id);
          } else if (dialog?.type === "restore") {
            handleRestoreConfirm(dialog.category.id);
          }
          setDialog(null);
        }}
        title={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Category"
        }
        subtitle={
          dialog?.type === "delete" || dialog?.type === "restore"
            ? dialog.category.name
            : undefined
        }
        description={
          dialog?.type === "delete" ? (
            <span>
              Are you sure you want to move{" "}
              <strong>{dialog.category.name}</strong> to trash?
            </span>
          ) : (
            <span>
              Restore{" "}
              <strong>
                {dialog?.type === "restore" ? dialog.category.name : ""}
              </strong>{" "}
              back to active categories?
            </span>
          )
        }
        confirmText={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Category"
        }
        cancelText="Cancel"
        variant={dialog?.type === "delete" ? "destructive" : "success"}
      />
    </div>
  );
};

export default CategoryPage;
