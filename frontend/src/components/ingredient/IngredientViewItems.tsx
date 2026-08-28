import React from "react";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/utils/formatCurrency";
import type { IngredientItem } from "@/services/ingredient";

interface IngredientViewProps {
  ingredient: IngredientItem;
  categoryLabel: string;
  formattedUpdatedAt: string;
  onEdit: (ingredient: IngredientItem) => void;
  onDelete: (ingredient: IngredientItem) => void;
  onRestore: (ingredient: IngredientItem) => void;
}

export const IngredientGridCard: React.FC<IngredientViewProps> = ({
  ingredient: item,
  categoryLabel,
  formattedUpdatedAt,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-2.5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-bold text-foreground line-clamp-1 leading-snug flex-1"
              title={item.name}
            >
              {item.name}
            </h3>
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
                Cost Price
              </span>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-sm font-black text-foreground font-mono">
                  {formatRupiah(item.costPrice)}
                </span>
                <span className="text-[10.5px] text-muted-foreground font-medium">
                  / {item.unit}
                </span>
              </div>
            </div>

            {item.supplierName && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px]">
                <span className="text-muted-foreground font-medium">
                  Supplier
                </span>
                <span
                  className="font-medium text-foreground truncate max-w-36"
                  title={item.supplierName}
                >
                  {item.supplierName}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground font-medium text-[10px] block truncate">
              Last Updated
            </span>
            <span className="font-bold text-xs text-foreground block truncate">
              {formattedUpdatedAt}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {item.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(item)}
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
                  onClick={() => onEdit(item)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Edit Ingredient"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item)}
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

export const IngredientTableRow: React.FC<IngredientViewProps> = ({
  ingredient: item,
  categoryLabel,
  formattedUpdatedAt,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-2.5 px-3 font-bold text-foreground">{item.name}</td>
      <td className="py-2.5 px-3 text-muted-foreground font-medium">
        {categoryLabel}
      </td>
      <td className="py-2.5 px-3 font-bold font-mono">
        {formatRupiah(item.costPrice)}{" "}
        <span className="text-[10px] text-muted-foreground font-normal">
          / {item.unit}
        </span>
      </td>
      <td className="py-2.5 px-3 text-muted-foreground hidden lg:table-cell">
        {item.supplierName || "-"}
      </td>
      <td className="py-2.5 px-3 text-muted-foreground text-xs font-medium whitespace-nowrap hidden xl:table-cell">
        {formattedUpdatedAt}
      </td>
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {item.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(item)}
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
                onClick={() => onEdit(item)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Ingredient"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item)}
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

export const IngredientMobileCard: React.FC<IngredientViewProps> = ({
  ingredient: item,
  categoryLabel,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="font-bold text-foreground leading-tight truncate">
              {item.name}
            </h4>
            <span className="text-[11px] text-muted-foreground block truncate">
              {categoryLabel}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
          <div className="flex items-center justify-between">
            <span>Cost / Unit:</span>
            <span className="font-bold text-foreground">
              {formatRupiah(item.costPrice)} / {item.unit}
            </span>
          </div>
          {item.supplierName && (
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">Supplier:</span>
              <span className="font-medium text-foreground truncate max-w-30">
                {item.supplierName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
          {item.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(item)}
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
                onClick={() => onEdit(item)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item)}
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
