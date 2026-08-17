import React, { useState, useMemo } from "react";
import type { CategoryItem } from "@/services/category";
import {
  getStoredCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
} from "@/services/category";
import { getStoredProducts } from "@/services/product";
import { CategoryDialog } from "@/components/category/CategoryDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  FolderTree,
  Package,
  FolderOpen,
  RotateCcw,
} from "lucide-react";

export const CategoryPage: React.FC = () => {
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(() =>
    getStoredCategories(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const products = useMemo(() => getStoredProducts(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    try {
      const saved = localStorage.getItem("sela_category_view_mode");
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
      localStorage.setItem("sela_category_view_mode", mode);
    } catch {
      // Safe fallback
    }
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [restoringCategory, setRestoringCategory] =
    useState<CategoryItem | null>(null);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const values: Record<string, number> = {};
    let grandTotalValue = 0;

    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      const itemValue = p.price * p.stock;
      values[p.category] = (values[p.category] || 0) + itemValue;
      grandTotalValue += itemValue;
    });

    const percentages: Record<string, number> = {};
    Object.keys(values).forEach((catId) => {
      percentages[catId] =
        grandTotalValue > 0
          ? Math.round((values[catId] / grandTotalValue) * 100)
          : 0;
    });

    return { counts, percentages };
  }, [products]);

  const stats = useMemo(() => {
    const activeCategories = allCategories.filter((c) => !c.isDeleted);
    const deletedCategories = allCategories.filter((c) => c.isDeleted);
    const total = activeCategories.length;
    const activeCount = activeCategories.filter(
      (c) => (categoryStats.counts[c.id] || 0) > 0,
    ).length;
    const emptyCount = total - activeCount;
    const archivedCount = deletedCategories.length;

    return { total, activeCount, emptyCount, archivedCount };
  }, [allCategories, categoryStats]);

  const filteredCategories = useMemo(() => {
    const targetList = allCategories.filter((c) =>
      showDeleted ? Boolean(c.isDeleted) : !c.isDeleted,
    );
    return targetList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description &&
          c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [allCategories, showDeleted, searchQuery]);

  const handleCreateOrUpdate = (
    data: Omit<CategoryItem, "id"> | CategoryItem,
  ) => {
    if ("id" in data && data.id) {
      const updated = updateCategory(data.id, data);
      if (updated) {
        setAllCategories(getStoredCategories(true));
        toast.success("Category updated successfully!");
      }
    } else {
      addCategory(data);
      setAllCategories(getStoredCategories(true));
      toast.success("New category added successfully!");
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = deleteCategory(id);
    if (success) {
      setAllCategories(getStoredCategories(true));
      toast.success("Category moved to archive");
    }
  };

  const handleRestore = (id: string) => {
    const success = restoreCategory(id);
    if (success) {
      setAllCategories(getStoredCategories(true));
      toast.success("Category restored successfully!");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      {/* Top 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Total Categories"
          value={`${stats.total} Active`}
          icon={FolderTree}
        />
        <StatCard
          title="Active In Use"
          value={`${stats.activeCount} Categories`}
          badgeText="Has Products"
          badgeVariant="success"
          icon={Package}
        />
        <StatCard
          title="Empty Categories"
          value={`${stats.emptyCount} Unassigned`}
          badgeText={stats.emptyCount > 0 ? "Empty" : "Clean"}
          badgeVariant={stats.emptyCount > 0 ? "danger" : "success"}
          icon={FolderOpen}
        />
        <StatCard
          title="Trash / Deleted"
          value={`${stats.archivedCount} Inactive`}
          badgeText={stats.archivedCount > 0 ? "Trash" : "Clean"}
          badgeVariant={stats.archivedCount > 0 ? "danger" : "success"}
          icon={Trash2}
        />
      </div>

      {/* Control Bar: Search, View Modes, Trash & Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              showDeleted
                ? "Search deleted categories..."
                : "Search category name or description..."
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

        {/* Right Actions: View Mode, Trash Toggle, Add Category */}
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
            <span>{showDeleted ? "Active Categories" : "Trash"}</span>
            {stats.archivedCount > 0 && !showDeleted && (
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            )}
          </Button>

          {/* Add Category Button */}
          {!showDeleted && (
            <Button
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
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
        {filteredCategories.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-dashed border-border/60">
            <p className="text-sm font-bold text-foreground">
              No categories found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching with another keyword or add a new category
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW (Option A: Stat-Progress Card) */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1 pb-6">
            {filteredCategories.map((c) => {
              const productCount = categoryStats.counts[c.id] || 0;
              const salesShare = categoryStats.percentages[c.id] || 0;
              return (
                <Card
                  key={c.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                    {/* Header: Name, Description & Sales Share Stat */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {c.description || "No description provided"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-primary leading-none block">
                          {salesShare}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
                          Sales Share
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Visual Contribution */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(salesShare, 4)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Product Count Badge & Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs">
                      <Badge
                        variant={productCount > 0 ? "secondary" : "outline"}
                        className="rounded-full text-[11px] px-2.5 py-0.5 shrink-0 font-semibold"
                      >
                        {productCount} Products
                      </Badge>
                      <div className="flex items-center gap-1 shrink-0">
                        {c.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoringCategory(c)}
                            className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
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
                              onClick={() => {
                                setEditingCategory(c);
                                setIsFormOpen(true);
                              }}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCategory(c)}
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
          /* TABLE VIEW ON DESKTOP/TABLET, AUTO-GRID ON MOBILE */
          <>
            {/* Desktop & Tablet Table View */}
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <th className="pb-2.5 px-3">Category Name</th>
                        <th className="pb-2.5 px-3">Description</th>
                        <th className="pb-2.5 px-3 text-center">
                          Assigned Products
                        </th>
                        <th className="pb-2.5 px-3 text-center">Sales Share</th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {filteredCategories.map((c) => {
                        const productCount = categoryStats.counts[c.id] || 0;
                        const salesShare = categoryStats.percentages[c.id] || 0;
                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <td className="py-3 px-3 font-bold text-foreground">
                              {c.name}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">
                              {c.description || "-"}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant={
                                  productCount > 0 ? "secondary" : "outline"
                                }
                                className="rounded-full text-[11px] font-bold px-2.5 py-0.5"
                              >
                                {productCount} Items
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant="secondary"
                                className="rounded-full text-[11px] font-extrabold px-2.5 py-0.5 bg-primary/10 text-primary border-transparent"
                              >
                                {salesShare}% of Sales
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {c.isDeleted ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRestoringCategory(c)}
                                    className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
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
                                      onClick={() => {
                                        setEditingCategory(c);
                                        setIsFormOpen(true);
                                      }}
                                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      title="Edit Category"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeletingCategory(c)}
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

            {/* Mobile Auto Grid View */}
            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {filteredCategories.map((c) => {
                const productCount = categoryStats.counts[c.id] || 0;
                const salesShare = categoryStats.percentages[c.id] || 0;
                return (
                  <Card
                    key={c.id}
                    className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                            {c.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {c.description || "No description provided"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-black text-primary leading-none block">
                            {salesShare}%
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
                            Sales Share
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-2 w-full bg-secondary/80 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(salesShare, 4)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs">
                        <Badge
                          variant={productCount > 0 ? "secondary" : "outline"}
                          className="rounded-full text-[11px] px-2.5 py-0.5 shrink-0 font-semibold"
                        >
                          {productCount} Products
                        </Badge>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.isDeleted ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoringCategory(c)}
                              className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
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
                                onClick={() => {
                                  setEditingCategory(c);
                                  setIsFormOpen(true);
                                }}
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingCategory(c)}
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
          </>
        )}
      </div>

      {/* Category Form Dialog */}
      <CategoryDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        title="Delete Category"
        subtitle="Confirm category deletion"
        description={
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              {deletingCategory?.name}
            </strong>
            ? Products assigned to this category may need to be re-categorized.
          </p>
        }
        confirmText="Delete Category"
        variant="destructive"
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (deletingCategory) {
            handleDeleteConfirm(deletingCategory.id);
            setDeletingCategory(null);
          }
        }}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!restoringCategory}
        title="Restore Category?"
        subtitle="Confirm category restoration"
        description={
          <p>
            Category{" "}
            <strong className="text-foreground">
              {restoringCategory?.name}
            </strong>{" "}
            will be restored to active list.
          </p>
        }
        confirmText="Restore Category"
        variant="success"
        onClose={() => setRestoringCategory(null)}
        onConfirm={() => {
          if (restoringCategory) {
            handleRestore(restoringCategory.id);
            setRestoringCategory(null);
          }
        }}
      />
    </div>
  );
};

export default CategoryPage;
