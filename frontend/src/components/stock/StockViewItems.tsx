import React from "react";
import { Settings2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import type { StockItem } from "@/services/stock";

export type StockItemWithMetrics = StockItem & { asset_value: number };

interface StockViewProps {
  item: StockItemWithMetrics;
  formattedUpdatedAt: string;
  renderStockBadge: (item: StockItem, isTable?: boolean) => React.ReactNode;
  onLimits: (item: StockItemWithMetrics) => void;
  onAdjust: (item: StockItemWithMetrics) => void;
}

export const StockGridCard: React.FC<StockViewProps> = ({
  item,
  formattedUpdatedAt,
  renderStockBadge,
  onLimits,
  onAdjust,
}) => {
  const percentage = Math.min(
    100,
    Math.round((item.quantity / (item.max_stock || 100)) * 100),
  );
  const isLow = item.quantity > 0 && item.quantity <= item.min_stock;
  const isOut = item.quantity === 0;

  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-0.5">
              <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight min-h-10">
                {item.product_name}
              </h3>
              <span className="text-xs text-muted-foreground block truncate">
                {item.category_name}
              </span>
            </div>
            {renderStockBadge(item, false)}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground font-medium text-xs">
                Current Stock:
              </span>
              <span className="text-base font-extrabold text-foreground font-mono">
                {formatNumber(item.quantity)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {item.unit}
                </span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Min: {formatNumber(item.min_stock)}</span>
                <span>Max: {formatNumber(item.max_stock)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isOut
                      ? "bg-destructive"
                      : isLow
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.max(4, percentage)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
              <span className="text-muted-foreground text-[11px]">
                Valuation:
              </span>
              <span className="font-bold text-foreground text-xs font-mono">
                {formatRupiah(item.asset_value)}
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
              {formattedUpdatedAt}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLimits(item)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              title="Set Alert Thresholds"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(item)}
              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
              title="Adjust Stock"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Adjust</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StockTableRow: React.FC<StockViewProps> = ({
  item,
  formattedUpdatedAt,
  renderStockBadge,
  onLimits,
  onAdjust,
}) => {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-2.5 px-3">
        <div className="min-w-0">
          <span className="font-bold text-foreground block truncate text-xs">
            {item.product_name}
          </span>
          <span className="text-[10.5px] text-muted-foreground block truncate lg:hidden">
            {item.category_name}
          </span>
        </div>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-medium hidden lg:table-cell">
        {item.category_name}
      </td>

      <td className="py-2.5 px-3 font-mono font-bold text-foreground whitespace-nowrap">
        {formatNumber(item.quantity)}{" "}
        <span className="text-[11px] text-muted-foreground font-normal">
          {item.unit}
        </span>
      </td>

      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        {renderStockBadge(item, true)}
      </td>

      <td className="py-2.5 px-3 text-right font-mono text-foreground font-semibold whitespace-nowrap hidden lg:table-cell">
        {formatRupiah(item.asset_value)}
      </td>

      <td className="py-2.5 px-3 text-center whitespace-nowrap text-muted-foreground text-xs font-medium hidden xl:table-cell">
        {formattedUpdatedAt}
      </td>

      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLimits(item)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title="Set Alert Thresholds"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdjust(item)}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
            title="Adjust Stock"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Adjust</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export const StockMobileCard: React.FC<StockViewProps> = ({
  item,
  formattedUpdatedAt,
  renderStockBadge,
  onLimits,
  onAdjust,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs space-y-2.5">
      <CardContent className="p-0 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="font-bold text-foreground text-xs sm:text-sm leading-tight">
              {item.product_name}
            </h4>
            <span className="text-[10px] text-muted-foreground block truncate">
              {item.category_name}
            </span>
          </div>
          {renderStockBadge(item, false)}
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-xs">
              Current Stock:
            </span>
            <span className="font-bold text-foreground font-mono text-sm">
              {formatNumber(item.quantity)} {item.unit}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Min Alert: {formatNumber(item.min_stock)} {item.unit}
            </span>
            <span>Valuation: {formatRupiah(item.asset_value)}</span>
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

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLimits(item)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdjust(item)}
              className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1 text-primary border-primary/40 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Adjust</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
