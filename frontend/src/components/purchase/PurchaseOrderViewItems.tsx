import React from "react";
import { FolderOpen, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { PurchaseOrderItem, PurchaseOrderStatus } from "@/services/purchase";

export const PurchaseStatusBadge: React.FC<{
  status: PurchaseOrderStatus;
  isTable?: boolean;
}> = ({ status, isTable = false }) => {
  if (isTable) {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span>Pending</span>
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Received</span>
          </span>
        );
      case "CANCELLED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            <span>Cancelled</span>
          </span>
        );
    }
  }

  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="rounded-lg text-[10.5px] font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 whitespace-nowrap select-none"
        >
          Pending
        </Badge>
      );
    case "RECEIVED":
      return (
        <Badge
          variant="outline"
          className="rounded-lg text-[10.5px] font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 whitespace-nowrap select-none"
        >
          Received
        </Badge>
      );
    case "CANCELLED":
    default:
      return (
        <Badge
          variant="outline"
          className="rounded-lg text-[10.5px] font-bold px-2.5 py-0.5 bg-destructive/10 text-destructive border-destructive/25 whitespace-nowrap select-none"
        >
          Cancelled
        </Badge>
      );
  }
};

interface PurchaseOrderViewProps {
  po: PurchaseOrderItem;
  onDetail: (po: PurchaseOrderItem) => void;
  onDelete?: (po: PurchaseOrderItem) => void;
  onRestore?: (po: PurchaseOrderItem) => void;
}

export const PurchaseOrderGridCard: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
  onDelete,
  onRestore,
}) => {
  return (
    <Card
      onClick={() => onDetail(po)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="font-mono text-[11px] font-bold text-primary tracking-tight">
                {po.po_number}
              </span>
              <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                {po.supplier_name}
              </h3>
            </div>
            <div className="shrink-0">
              <PurchaseStatusBadge status={po.status} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold">Materials Configured</span>
              <span className="font-semibold">
                {po.items.length} {po.items.length > 1 ? "materials" : "material"}
              </span>
            </div>

            <div className="space-y-1 min-h-11 flex flex-col justify-center">
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span
                    className="font-medium text-foreground truncate"
                    title={po.items[0]?.ingredient_name}
                  >
                    {po.items[0]?.ingredient_name || "No material"}
                  </span>
                </div>
                {po.items[0] && (
                  <span className="font-mono text-[10.5px] text-muted-foreground shrink-0">
                    ({formatNumber(po.items[0].quantity)} {po.items[0].unit})
                  </span>
                )}
              </div>

              {po.items.length > 1 ? (
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span
                      className="font-medium text-foreground truncate"
                      title={po.items[1]?.ingredient_name}
                    >
                      {po.items[1]?.ingredient_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      ({formatNumber(po.items[1]?.quantity)} {po.items[1]?.unit})
                    </span>
                    {po.items.length > 2 && (
                      <span className="inline-flex items-center text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-1 py-0.2 rounded-md whitespace-nowrap">
                        +{po.items.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-[11px] text-muted-foreground/35 select-none h-4">
                  <span className="pl-3">—</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground text-xs font-semibold">
                Total Cost:
              </span>
              <span className="text-sm font-extrabold text-foreground font-mono">
                {formatRupiah(po.total_amount)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
          <div className="min-w-0 flex-1">
            <span className="text-muted-foreground font-medium text-[10px] block truncate">
              Order Date
            </span>
            <span className="font-bold text-xs text-foreground block truncate">
              {formatDate(po.order_date)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {po.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(po);
                }}
                className="h-7.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                title="Restore Purchase Order"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </Button>
            ) : (
              <>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(po);
                    }}
                    className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Move to Trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetail(po);
                  }}
                  className="h-7.5 px-2.5 rounded-lg text-xs font-semibold gap-1.5 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs transition-all active:scale-95"
                  title="Open Purchase Order Details"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PurchaseOrderTableRow: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
  onDelete,
  onRestore,
}) => {
  return (
    <tr
      onClick={() => onDetail(po)}
      className="group hover:bg-muted/40 transition-colors cursor-pointer text-xs"
    >
      <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
        {po.po_number}
      </td>
      <td className="py-2.5 px-3">
        <div className="min-w-0">
          <span className="font-bold text-foreground block truncate max-w-48">
            {po.supplier_name}
          </span>
          <span className="text-[10.5px] text-muted-foreground block truncate md:hidden">
            {formatDate(po.order_date)}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-muted-foreground text-xs font-medium whitespace-nowrap hidden md:table-cell">
        {formatDate(po.order_date)}
      </td>
      <td className="py-2.5 px-3 hidden lg:table-cell">
        <div className="leading-tight min-w-0">
          <span className="font-medium text-foreground truncate block max-w-48">
            {po.items[0]?.ingredient_name || "-"}
          </span>
          {po.items.length > 1 && (
            <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
              +{po.items.length - 1} other {po.items.length > 2 ? "materials" : "material"}
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3 font-mono font-bold text-foreground whitespace-nowrap text-right">
        {formatRupiah(po.total_amount)}
      </td>
      <td className="py-2.5 px-3 text-center whitespace-nowrap">
        <PurchaseStatusBadge status={po.status} isTable={true} />
      </td>
      <td
        className="py-2.5 px-3 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1">
          {po.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore?.(po)}
              className="h-7.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
              title="Restore Purchase Order"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDetail(po)}
                className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="View Details"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(po)}
                  className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export const PurchaseOrderMobileCard: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
  onDelete,
  onRestore,
}) => {
  return (
    <Card
      onClick={() => onDetail(po)}
      className="border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground p-3.5 space-y-2.5 select-none cursor-pointer hover:border-primary transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[11px] font-bold text-primary">
            {po.po_number}
          </span>
          <h4 className="text-xs font-bold text-foreground line-clamp-1">
            {po.supplier_name}
          </h4>
        </div>
        <div className="shrink-0">
          <PurchaseStatusBadge status={po.status} />
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-xs">
        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
          <span>{formatDate(po.order_date)}</span>
          <span className="font-semibold">{po.items.length} materials</span>
        </div>
        <div className="flex items-center justify-between font-mono pt-1 border-t border-border/40">
          <span className="text-muted-foreground text-[11px] font-sans">Total:</span>
          <span className="font-bold text-foreground">{formatRupiah(po.total_amount)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">Tap card for details</span>
        <div className="flex items-center gap-1">
          {po.isDeleted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRestore?.(po);
              }}
              className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/40 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </Button>
          ) : (
            <>
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(po);
                  }}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Move to Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDetail(po);
                }}
                className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1.5 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
