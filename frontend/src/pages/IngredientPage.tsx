import React, { useState, useMemo } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Wheat,
  Tags,
  Filter,
  ChevronDown,
  Check,
  RotateCcw,
  Truck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";

export const IngredientPage: React.FC = () => {
  const [allIngredients, setAllIngredients] = useState<IngredientItem[]>(() =>
    getStoredIngredients(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_ingredient_view_mode",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] =
    useState<IngredientItem | null>(null);
  const [deletingIngredient, setDeletingIngredient] =
    useState<IngredientItem | null>(null);
  const [restoringIngredient, setRestoringIngredient] =
    useState<IngredientItem | null>(null);

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

  const categoriesList = [
    { id: "all", label: "All Categories" },
    ...categories,
  ];

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
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supplierName &&
          item.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [allIngredients, showDeleted, searchQuery, selectedCategory]);

  const {
    sortedItems: displayedIngredients,
    sortConfig,
    requestSort,
  } = useTableSort(filteredIngredients, "name", "asc");

  const handleCreateOrUpdate = (
    data: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
  ) => {
    if (editingIngredient) {
      const updated = updateIngredient(editingIngredient.id, data);
      if (updated) {
        setAllIngredients(getStoredIngredients(true));
        toast.success(`Ingredient "${updated.name}" updated successfully!`);
      }
      setEditingIngredient(null);
    } else {
      const created = addIngredient(data);
      setAllIngredients(getStoredIngredients(true));
      toast.success(`Ingredient "${created.name}" added to catalog!`);
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
          badgeVariant="success"
          icon={Tags}
        />
        <StatCard
          title="Partner Suppliers"
          value={`${stats.supplierCount} Suppliers`}
          badgeText="Supplying"
          badgeVariant="neutral"
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
            placeholder="Search raw material name, SKU, or supplier..."
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
                  setEditingIngredient(null);
                  setIsFormOpen(true);
                }}
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
              <Card
                key={item.id}
                className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-xs text-muted-foreground block truncate">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10.5px] px-2.5 py-0.5 shrink-0 font-semibold font-mono"
                      >
                        {item.unit}
                      </Badge>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground text-xs font-medium">
                          Standard Cost:
                        </span>
                        <span className="text-base font-extrabold text-foreground font-mono">
                          {formatRupiah(item.costPrice)}
                          <span className="text-xs font-normal text-muted-foreground ml-0.5">
                            /{item.unit}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-muted-foreground font-medium text-[11px]">
                          Supplier / PT:
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-36 text-right text-xs">
                          {item.supplierName || "Direct / No Partner"}
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
                        {formatLastUpdated(item.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoringIngredient(item)}
                          className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                          title="Restore Ingredient"
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
                              setEditingIngredient(item);
                              setIsFormOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            title="Edit Ingredient"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingIngredient(item)}
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
                        <th
                          onClick={() => requestSort("name")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Material Name</span>
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
                        <th className="pb-2.5 px-3 text-center">Unit</th>
                        <th
                          onClick={() => requestSort("costPrice")}
                          className="pb-2.5 px-3 text-right cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Standard Cost</span>
                            {sortConfig?.key === "costPrice" ? (
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
                          onClick={() => requestSort("updatedAt")}
                          className="pb-2.5 px-3 text-center cursor-pointer select-none group hover:text-foreground transition-colors hidden sm:table-cell"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Last Updated</span>
                            {sortConfig?.key === "updatedAt" ? (
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
                        <th className="pb-2.5 px-3 hidden lg:table-cell">
                          Supplier
                        </th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedIngredients.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-foreground block truncate text-xs sm:text-sm">
                              {item.name}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground font-medium hidden md:table-cell">
                            {getCategoryLabel(item.category)}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className="rounded-full text-[11px] font-mono font-medium px-2 py-0.5"
                            >
                              {item.unit}
                            </Badge>
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-foreground font-semibold whitespace-nowrap">
                            {formatRupiah(item.costPrice)}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-muted-foreground text-xs hidden sm:table-cell">
                            {formatLastUpdated(item.updatedAt)}
                          </td>

                          <td className="py-2.5 px-3 hidden lg:table-cell whitespace-nowrap text-muted-foreground text-[11px]">
                            {item.supplierName ? (
                              <span className="inline-flex items-center gap-1">
                                <Truck className="w-3 h-3 text-primary/70 shrink-0" />
                                <span className="truncate max-w-36">
                                  {item.supplierName}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {item.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRestoringIngredient(item)}
                                  className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                                  title="Restore Ingredient"
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
                                      setEditingIngredient(item);
                                      setIsFormOpen(true);
                                    }}
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                    title="Edit Ingredient"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingIngredient(item)}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3.5 pt-1 pb-6">
              {displayedIngredients.map((item) => (
                <Card
                  key={item.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                          {item.name}
                        </h3>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10.5px] px-2 py-0.5 shrink-0 font-medium font-mono"
                      >
                        {item.unit}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground text-xs">
                          Standard Cost:
                        </span>
                        <span className="font-bold text-foreground font-mono">
                          {formatRupiah(item.costPrice)}/{item.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Supplier / PT:
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-36">
                          {item.supplierName || "Direct / No Partner"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-muted-foreground font-medium text-[10px] block truncate">
                          Last Updated
                        </span>
                        <span className="font-bold text-xs text-foreground block truncate">
                          {formatLastUpdated(item.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.isDeleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoringIngredient(item)}
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
                              onClick={() => {
                                setEditingIngredient(item);
                                setIsFormOpen(true);
                              }}
                              className="h-8 w-8 rounded-lg text-muted-foreground"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingIngredient(item)}
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
              ))}
            </div>
          </div>
        )}
      </div>

      <IngredientDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIngredient(null);
        }}
        ingredient={editingIngredient}
        onSave={handleCreateOrUpdate}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingIngredient)}
        onClose={() => setDeletingIngredient(null)}
        onConfirm={() => {
          if (deletingIngredient) {
            handleDeleteConfirm(deletingIngredient.id);
            setDeletingIngredient(null);
          }
        }}
        title="Move to Trash"
        subtitle={deletingIngredient?.name}
        description={
          <span>
            Are you sure you want to move{" "}
            <strong>{deletingIngredient?.name}</strong> to trash?
          </span>
        }
        confirmText="Move to Trash"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={Boolean(restoringIngredient)}
        onClose={() => setRestoringIngredient(null)}
        onConfirm={() => {
          if (restoringIngredient) {
            handleRestoreConfirm(restoringIngredient.id);
            setRestoringIngredient(null);
          }
        }}
        title="Restore Ingredient"
        subtitle={restoringIngredient?.name}
        description={
          <span>
            Restore <strong>{restoringIngredient?.name}</strong> back to active
            catalog?
          </span>
        }
        confirmText="Restore Catalog"
        cancelText="Cancel"
        variant="success"
      />
    </div>
  );
};

export default IngredientPage;
