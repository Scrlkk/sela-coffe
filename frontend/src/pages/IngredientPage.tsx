import React, { useState, useMemo, useDeferredValue } from "react";
import type { IngredientItem } from "@/services/ingredient";
import {
  getStoredIngredients,
  addIngredient,
  updateIngredient,
  softDeleteIngredient,
  restoreIngredient,
} from "@/services/ingredient";
import { getStoredCategories } from "@/services/category";
import { IngredientDialog } from "@/components/ingredient/IngredientDialog";
import {
  IngredientGridCard,
  IngredientTableRow,
  IngredientMobileCard,
} from "@/components/ingredient/IngredientViewItems";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { formatLastUpdated } from "@/utils/formatDate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Trash2,
  Wheat,
  Tags,
  Filter,
  Truck,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type IngredientDialogState =
  | { type: "create" }
  | { type: "edit"; ingredient: IngredientItem }
  | { type: "delete"; ingredient: IngredientItem }
  | { type: "restore"; ingredient: IngredientItem }
  | null;

export const IngredientPage: React.FC = () => {
  const [allIngredients, setAllIngredients] = useState<IngredientItem[]>(() =>
    getStoredIngredients(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_ingredient_view_mode",
  );

  const [dialog, setDialog] = useState<IngredientDialogState>(null);

  const stats = useMemo(() => {
    const active = allIngredients.filter((i) => !i.isDeleted);
    const total = active.length;
    const categoryCount = new Set(active.map((i) => i.category)).size;
    const supplierCount = new Set(
      active.map((i) => i.supplierId).filter(Boolean),
    ).size;
    const archivedCount = allIngredients.filter((i) => i.isDeleted).length;

    return { total, categoryCount, supplierCount, archivedCount };
  }, [allIngredients]);

  const categories = useMemo(() => {
    return getStoredCategories(false, "ingredient").map((c) => ({
      id: c.id,
      label: c.name,
    }));
  }, []);

  const categoriesList = useMemo(() => {
    return [{ id: "all", label: "All Categories" }, ...categories];
  }, [categories]);

  const getCategoryLabel = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  const filteredIngredients = useMemo(() => {
    const targetList = allIngredients.filter((item) =>
      showDeleted ? Boolean(item.isDeleted) : !item.isDeleted,
    );

    return targetList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (item.supplierName &&
          item.supplierName
            .toLowerCase()
            .includes(deferredSearch.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [allIngredients, showDeleted, deferredSearch, selectedCategory]);

  const {
    sortedItems: displayedIngredients,
    sortConfig,
    requestSort,
  } = useTableSort(filteredIngredients, "name", "asc");

  const handleCreateOrUpdate = (
    data: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
  ) => {
    if (dialog?.type === "edit") {
      const updated = updateIngredient(dialog.ingredient.id, data);
      if (updated) {
        setAllIngredients(getStoredIngredients(true));
        toast.success(`Ingredient "${updated.name}" updated successfully!`);
      }
    } else {
      const created = addIngredient(data);
      setAllIngredients(getStoredIngredients(true));
      toast.success(`Ingredient "${created.name}" created successfully!`);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const success = softDeleteIngredient(id);
    if (success) {
      setAllIngredients(getStoredIngredients(true));
      toast.success("Ingredient moved to trash");
    }
  };

  const handleRestoreConfirm = (id: string) => {
    const success = restoreIngredient(id);
    if (success) {
      setAllIngredients(getStoredIngredients(true));
      toast.success("Ingredient restored to active catalog");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Raw Materials"
          value={`${stats.total} Items`}
          icon={Wheat}
        />
        <StatCard
          title="Active Categories"
          value={`${stats.categoryCount} Categories`}
          badgeText="In Use"
          badgeVariant="neutral"
          icon={Tags}
        />
        <StatCard
          title="Active Suppliers"
          value={`${stats.supplierCount} Suppliers`}
          badgeText="Partners"
          badgeVariant="success"
          icon={Truck}
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
            placeholder="Search raw material name or supplier..."
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
                <span>Add Ingredient</span>
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
        {displayedIngredients.length === 0 ? (
          <EmptyState
            title="No raw ingredients found"
            description={
              searchQuery
                ? `No ingredients match "${searchQuery}".`
                : showDeleted
                  ? "Archived ingredients trash is currently empty."
                  : "No raw materials registered yet. Click 'Add Ingredient' to get started."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
            {displayedIngredients.map((item) => (
              <IngredientGridCard
                key={item.id}
                ingredient={item}
                categoryLabel={getCategoryLabel(item.category)}
                formattedUpdatedAt={formatLastUpdated(item.updatedAt)}
                onEdit={(ingredient) => setDialog({ type: "edit", ingredient })}
                onDelete={(ingredient) =>
                  setDialog({ type: "delete", ingredient })
                }
                onRestore={(ingredient) =>
                  setDialog({ type: "restore", ingredient })
                }
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
                          label="Item Name"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <SortableTh
                          label="Category"
                          sortKey="category"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <SortableTh
                          label="Cost / Unit"
                          sortKey="costPrice"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="py-2.5 px-3 hidden lg:table-cell">
                          Supplier
                        </th>
                        <SortableTh
                          label="Last Updated"
                          sortKey="updatedAt"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="hidden xl:table-cell"
                        />
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedIngredients.map((item) => (
                        <IngredientTableRow
                          key={item.id}
                          ingredient={item}
                          categoryLabel={getCategoryLabel(item.category)}
                          formattedUpdatedAt={formatLastUpdated(item.updatedAt)}
                          onEdit={(ingredient) =>
                            setDialog({ type: "edit", ingredient })
                          }
                          onDelete={(ingredient) =>
                            setDialog({ type: "delete", ingredient })
                          }
                          onRestore={(ingredient) =>
                            setDialog({ type: "restore", ingredient })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedIngredients.map((item) => (
                <IngredientMobileCard
                  key={item.id}
                  ingredient={item}
                  categoryLabel={getCategoryLabel(item.category)}
                  formattedUpdatedAt={formatLastUpdated(item.updatedAt)}
                  onEdit={(ingredient) =>
                    setDialog({ type: "edit", ingredient })
                  }
                  onDelete={(ingredient) =>
                    setDialog({ type: "delete", ingredient })
                  }
                  onRestore={(ingredient) =>
                    setDialog({ type: "restore", ingredient })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <IngredientDialog
        isOpen={dialog?.type === "create" || dialog?.type === "edit"}
        onClose={() => setDialog(null)}
        ingredient={dialog?.type === "edit" ? dialog.ingredient : null}
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
            handleDeleteConfirm(dialog.ingredient.id);
          } else if (dialog?.type === "restore") {
            handleRestoreConfirm(dialog.ingredient.id);
          }
          setDialog(null);
        }}
        title={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Ingredient"
        }
        subtitle={
          dialog?.type === "delete" || dialog?.type === "restore"
            ? dialog.ingredient.name
            : undefined
        }
        description={
          dialog?.type === "delete" ? (
            <span>
              Are you sure you want to move{" "}
              <strong>{dialog.ingredient.name}</strong> to trash?
            </span>
          ) : (
            <span>
              Restore{" "}
              <strong>
                {dialog?.type === "restore" ? dialog.ingredient.name : ""}
              </strong>{" "}
              back to active catalog?
            </span>
          )
        }
        confirmText={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Catalog"
        }
        cancelText="Cancel"
        variant={dialog?.type === "delete" ? "destructive" : "success"}
      />
    </div>
  );
};

export default IngredientPage;
