import React from "react";
import type { StockLogItem } from "@/services/stock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownUp,
  Calendar,
  User,
  FileText,
  Package,
} from "lucide-react";
import { formatDateTime } from "@/utils/formatDate";
import { formatNumber, formatStockDelta } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface StockMovementDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  log: StockLogItem | null;
}

export const StockMovementDetailDialog: React.FC<
  StockMovementDetailDialogProps
> = ({ isOpen, onClose, log }) => {
  if (!log) return null;

  const isIncoming = log.type === "in";
  const isOutgoing = log.type === "out";

  const getHeaderIcon = () => {
    if (isIncoming) {
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    }
    if (isOutgoing) {
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-muted text-muted-foreground border border-border/60 flex items-center justify-center shrink-0">
        <ArrowDownUp className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    );
  };

  const getMovementBadge = () => {
    if (isIncoming) {
      return (
        <Badge
          variant="outline"
          className="rounded-full text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Restock
        </Badge>
      );
    }
    if (isOutgoing) {
      return (
        <Badge
          variant="outline"
          className="rounded-full text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 bg-destructive/10 text-destructive border-destructive/25 gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          Usage
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="rounded-full text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 bg-muted text-muted-foreground border border-border/60 gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
        Opname
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="gap-2.5 sm:gap-3">
          {getHeaderIcon()}
          <div className="space-y-0.5 min-w-0 pr-6">
            <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
              Stock Movement Detail
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground font-mono">
              Log ID #{log.id}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-0 text-xs">
          <div className="p-3 sm:p-3.5 bg-muted/40 border border-border/70 rounded-xl sm:rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span>Raw Material</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
              {log.product_name}
            </h3>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Quantity Change
              </span>
              {getMovementBadge()}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-extrabold font-mono tracking-tight",
                  isIncoming
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isOutgoing
                      ? "text-destructive"
                      : "text-amber-600 dark:text-amber-400",
                )}
              >
                {formatStockDelta(log.type, log.quantity, "Set to")}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {log.unit}
              </span>
            </div>

            <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] sm:text-xs">
              <span className="text-muted-foreground font-medium">
                Balance Flow:
              </span>
              <span className="font-mono font-bold text-foreground">
                <span className="text-muted-foreground/70 font-normal">
                  {formatNumber(log.quantity_before)} →{" "}
                </span>
                <strong className="text-foreground font-extrabold">
                  {formatNumber(log.quantity_after)} {log.unit}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold">
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Operator</span>
              </div>
              <p className="font-bold text-foreground text-[11px] sm:text-xs truncate">
                {log.user_name}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Recorded Date & Time</span>
              </div>
              <p className="font-bold text-foreground text-[11px] sm:text-xs font-mono">
                {formatDateTime(log.created_at)}
              </p>
            </div>

            <div className="sm:col-span-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Note / Remarks</span>
              </div>
              <p className="text-[11px] sm:text-xs text-foreground font-medium whitespace-pre-wrap leading-relaxed">
                {log.note || "-"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementDetailDialog;
