import React from "react";
import { Coffee, Wheat, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryItem } from "@/services/category";

export type CategoryWithCount = CategoryItem & { itemCount: number };

interface CategoryViewProps {
  category: CategoryWithCount;
  activeTab: "product" | "ingredient";
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
  onRestore: (category: CategoryWithCount) => void;
}

export const CategoryGridCard: React.FC<CategoryViewProps> = ({
  category: c,
  activeTab,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const count = c.itemCount;
  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-2.5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {activeTab === "product" ? (
                  <Coffee className="w-4 h-4" />
                ) : (
                  <Wheat className="w-4 h-4" />
                )}
              </div>
              <h3
                className="font-bold text-foreground text-sm leading-snug truncate flex-1"
                title={c.name}
              >
                {c.name}
              </h3>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium">Type</span>
              <span className="font-semibold text-foreground truncate max-w-36">
                {activeTab === "product" ? "Product Category" : "Raw Material"}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Linked Items
              </span>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-sm font-black text-foreground font-mono">
                  {count}
                </span>
                <span className="text-[10.5px] text-muted-foreground font-medium">
                  {count === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {c.description && (
              <div className="pt-1 border-t border-border/40 text-[11px] text-muted-foreground line-clamp-1">
                {c.description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground font-medium text-[10px] block truncate">
              Status
            </span>
            <span
              className={cn(
                "font-bold text-xs block truncate",
                c.isDeleted
                  ? "text-destructive"
                  : count > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {c.isDeleted ? "Trash" : count > 0 ? "In Use" : "Unused"}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {c.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(c)}
                className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
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
                  onClick={() => onEdit(c)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(c)}
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
};

export const CategoryTableRow: React.FC<CategoryViewProps> = ({
  category: c,
  activeTab,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const count = c.itemCount;
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-2.5 px-3 font-bold text-foreground w-[24%] lg:w-[22%]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {activeTab === "product" ? (
              <Coffee className="w-3.5 h-3.5" />
            ) : (
              <Wheat className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="truncate">{c.name}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-muted-foreground truncate text-xs w-[32%] lg:w-[34%]">
        {c.description || "—"}
      </td>
      <td className="py-2.5 px-3 text-center font-bold font-mono text-xs whitespace-nowrap w-[14%] lg:w-[14%]">
        {count}
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap hidden lg:table-cell w-[15%] lg:w-[15%]">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              count > 0 ? "bg-emerald-500" : "bg-muted-foreground/50",
            )}
          />
          <span
            className={
              count > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }
          >
            {count > 0 ? "In Use" : "Unused"}
          </span>
        </span>
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap w-[15%] lg:w-[15%]">
        <div className="flex items-center justify-end gap-1">
          {c.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(c)}
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
                onClick={() => onEdit(c)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Category"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(c)}
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
};

export const CategoryMobileCard: React.FC<CategoryViewProps> = ({
  category: c,
  activeTab,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const count = c.itemCount;
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {activeTab === "product" ? (
                <Coffee className="w-4 h-4" />
              ) : (
                <Wheat className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-foreground leading-tight truncate">
                {c.name}
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {count} {activeTab === "product" ? "products" : "materials"}
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
          <p className="text-xs text-muted-foreground line-clamp-1">
            {c.description}
          </p>
        )}

        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
          {c.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(c)}
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
                onClick={() => onEdit(c)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(c)}
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
};
