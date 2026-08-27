import React from "react";
import { User, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber, formatStockDelta } from "@/utils/formatCurrency";
import { formatDate, formatTime, formatDateTime } from "@/utils/formatDate";
import type { StockLogItem } from "@/services/stock";

interface StockMovementViewProps {
  log: StockLogItem;
  renderMovementType: (
    type: StockLogItem["type"],
    isTable?: boolean,
  ) => React.ReactNode;
  onSelect: (log: StockLogItem) => void;
}

export const StockMovementGridCard: React.FC<StockMovementViewProps> = ({
  log,
  renderMovementType,
  onSelect,
}) => {
  return (
    <Card
      onClick={() => onSelect(log)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight min-h-9 sm:min-h-10">
                {log.product_name}
              </h3>
            </div>
            <div className="shrink-0">{renderMovementType(log.type)}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Delta Change:
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span
                  className={cn(
                    "text-sm sm:text-base font-black tracking-tight",
                    log.type === "in"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : log.type === "out"
                        ? "text-destructive"
                        : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {formatStockDelta(log.type, log.quantity)}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {log.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs font-mono">
              <span className="text-muted-foreground text-[11px] font-sans">
                Balance:
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground/60 line-through text-[11px]">
                  {formatNumber(log.quantity_before)}
                </span>
                <span className="text-muted-foreground text-[10px]">→</span>
                <span className="font-extrabold text-foreground bg-card px-1.5 py-0.5 rounded-md border border-border/60 shadow-2xs text-xs">
                  {formatNumber(log.quantity_after)} {log.unit}
                </span>
              </div>
            </div>
          </div>

          {log.note && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 pt-0.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span
                className="text-xs text-muted-foreground line-clamp-1 font-medium flex-1 leading-normal"
                title={log.note}
              >
                {log.note}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground font-medium text-[10px] block truncate">
              Date & Time
            </span>
            <span className="font-bold text-xs text-foreground block truncate font-mono">
              {formatDateTime(log.created_at)}
            </span>
          </div>

          <div className="min-w-0 text-right">
            <span className="text-muted-foreground font-medium text-[10px] block truncate">
              Operator
            </span>
            <span className="font-bold text-xs text-foreground block truncate">
              {log.user_name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const StockMovementTableRow: React.FC<StockMovementViewProps> = ({
  log,
  renderMovementType,
  onSelect,
}) => {
  return (
    <tr
      onClick={() => onSelect(log)}
      className="hover:bg-muted/40 transition-colors cursor-pointer"
    >
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-foreground text-xs">
            {formatDate(log.created_at)}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatTime(log.created_at)}
          </span>
        </div>
      </td>

      <td className="py-2.5 px-3">
        <span className="font-bold text-foreground block truncate text-xs leading-tight">
          {log.product_name}
        </span>
      </td>

      <td className="py-2.5 px-3 text-center whitespace-nowrap hidden lg:table-cell">
        {renderMovementType(log.type, true)}
      </td>

      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
        <span
          className={cn(
            "text-xs font-extrabold",
            log.type === "in"
              ? "text-emerald-600 dark:text-emerald-400"
              : log.type === "out"
                ? "text-destructive"
                : "text-amber-600 dark:text-amber-400",
          )}
        >
          {formatStockDelta(log.type, log.quantity)}
        </span>{" "}
        <span className="text-muted-foreground text-[10px] font-medium">
          {log.unit}
        </span>
      </td>

      <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 text-xs leading-tight">
          <span className="text-muted-foreground/60 text-[10px] hidden sm:inline">
            {formatNumber(log.quantity_before)} →
          </span>
          <span className="font-bold text-foreground">
            {formatNumber(log.quantity_after)}
          </span>
          <span className="text-muted-foreground text-[10px]">{log.unit}</span>
        </div>
      </td>

      <td className="py-2.5 px-3 hidden xl:table-cell max-w-28 lg:max-w-36">
        <span
          className="text-[11px] text-muted-foreground truncate block font-medium"
          title={log.note || "-"}
        >
          {log.note || "-"}
        </span>
      </td>

      <td className="py-2.5 px-3 hidden md:table-cell whitespace-nowrap text-muted-foreground text-xs">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground truncate max-w-28">
            {log.user_name}
          </span>
        </div>
      </td>
    </tr>
  );
};

export const StockMovementMobileCard: React.FC<StockMovementViewProps> = ({
  log,
  renderMovementType,
  onSelect,
}) => {
  return (
    <Card
      onClick={() => onSelect(log)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground p-4 space-y-3 cursor-pointer hover:border-primary transition-colors"
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-foreground text-xs sm:text-sm leading-snug truncate">
              {log.product_name}
            </h4>
          </div>
          <div className="shrink-0">{renderMovementType(log.type)}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Delta Change:
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span
                className={cn(
                  "text-sm sm:text-base font-black tracking-tight",
                  log.type === "in"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : log.type === "out"
                      ? "text-destructive"
                      : "text-amber-600 dark:text-amber-400",
                )}
              >
                {formatStockDelta(log.type, log.quantity)}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {log.unit}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border/30 text-xs font-mono">
            <span className="text-muted-foreground text-[11px] font-sans">
              Balance:
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground/60 line-through text-[11px]">
                {formatNumber(log.quantity_before)}
              </span>
              <span className="text-muted-foreground text-[10px]">→</span>
              <span className="font-extrabold text-foreground bg-card px-1.5 py-0.5 rounded-md border border-border/60 shadow-2xs text-xs">
                {formatNumber(log.quantity_after)} {log.unit}
              </span>
            </div>
          </div>
        </div>

        {log.note && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 pt-0.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span
              className="text-xs text-muted-foreground line-clamp-1 font-medium flex-1 leading-normal"
              title={log.note}
            >
              {log.note}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
        <div className="min-w-0 flex-1">
          <span className="text-muted-foreground font-medium text-[10px] block truncate">
            Date & Time
          </span>
          <span className="font-bold text-xs text-foreground block truncate font-mono">
            {formatDateTime(log.created_at)}
          </span>
        </div>

        <div className="min-w-0 text-right">
          <span className="text-muted-foreground font-medium text-[10px] block truncate">
            Operator
          </span>
          <span className="font-bold text-xs text-foreground block truncate">
            {log.user_name}
          </span>
        </div>
      </div>
    </Card>
  );
};
