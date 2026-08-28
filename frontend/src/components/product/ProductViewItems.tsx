import React from "react";
import { Store, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/utils/formatCurrency";
import type { ProductItem } from "@/services/product";

interface ProductViewProps {
  product: ProductItem;
  categoryLabel: string;
  onTogglePos: (product: ProductItem) => void;
  onEdit: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
  onRestore: (product: ProductItem) => void;
}

export const ProductGridCard: React.FC<ProductViewProps> = ({
  product: p,
  categoryLabel,
  onTogglePos,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isPosActive = p.is_active !== false;

  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-2.5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug flex-1">
              {p.name}
            </h3>

            <span
              className={cn(
                "w-2 h-2 rounded-full mt-1 shrink-0 shadow-2xs",
                isPosActive
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-muted-foreground/40",
              )}
              title={isPosActive ? "Active on POS" : "Hidden from POS"}
            />
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium">Category</span>
              <span
                className="font-semibold text-foreground truncate max-w-36"
                title={categoryLabel}
              >
                {categoryLabel}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Price
              </span>
              <span className="text-sm font-black text-foreground font-mono">
                {formatRupiah(p.price)}
              </span>
            </div>
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
                p.isDeleted
                  ? "text-destructive"
                  : isPosActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {p.isDeleted ? "Trash" : isPosActive ? "Menu Ready" : "Off Menu"}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {p.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(p)}
                className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
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
                  onClick={() => onTogglePos(p)}
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
                  onClick={() => onEdit(p)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Edit Product"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(p)}
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
};

export const ProductTableRow: React.FC<ProductViewProps> = ({
  product: p,
  categoryLabel,
  onTogglePos,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isPosActive = p.is_active !== false;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-2.5 px-3 w-[28%] lg:w-[30%]">
        <span
          className="font-bold text-foreground block truncate text-xs"
          title={p.name}
        >
          {p.name}
        </span>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-medium hidden md:table-cell w-[16%] lg:w-[18%] truncate">
        {categoryLabel}
      </td>

      <td className="py-2.5 px-3 text-right font-mono text-foreground font-semibold whitespace-nowrap w-[20%] lg:w-[18%]">
        {formatRupiah(p.price)}
      </td>

      <td className="py-2.5 px-3 text-center whitespace-nowrap w-[18%] lg:w-[17%]">
        <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isPosActive ? "bg-emerald-500" : "bg-muted-foreground/50",
            )}
          />
          <span
            className={
              isPosActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }
          >
            {isPosActive ? "Active" : "Off Menu"}
          </span>
        </span>
      </td>

      <td className="py-2.5 px-3 text-right whitespace-nowrap w-[18%] lg:w-[17%]">
        <div className="flex items-center justify-end gap-1">
          {p.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(p)}
              className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
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
                onClick={() => onTogglePos(p)}
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
                onClick={() => onEdit(p)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Product"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(p)}
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
};

export const ProductMobileCard: React.FC<ProductViewProps> = ({
  product: p,
  categoryLabel,
  onTogglePos,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isPosActive = p.is_active !== false;

  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
              {p.name}
            </h3>
            <span className="text-[10px] text-muted-foreground block truncate">
              {categoryLabel}
            </span>
          </div>
          <span
            className={cn(
              "w-2 h-2 rounded-full mt-1 shrink-0",
              isPosActive
                ? "bg-emerald-500 shadow-emerald-500/50"
                : "bg-muted-foreground/40",
            )}
            title={isPosActive ? "Active on POS" : "Hidden from POS"}
          />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-xs">Price:</span>
            <span className="font-bold text-foreground font-mono">
              {formatRupiah(p.price)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span
              className={cn(
                "font-bold text-xs",
                p.isDeleted
                  ? "text-destructive"
                  : isPosActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {p.isDeleted ? "Trash" : isPosActive ? "Menu Ready" : "Off Menu"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
          {p.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(p)}
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
                onClick={() => onTogglePos(p)}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  isPosActive
                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                    : "text-muted-foreground",
                )}
                title={isPosActive ? "Hide from POS" : "Activate on POS"}
              >
                <Store className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(p)}
                className="h-8 w-8 rounded-lg text-muted-foreground"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(p)}
                className="h-8 w-8 rounded-lg text-destructive"
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
