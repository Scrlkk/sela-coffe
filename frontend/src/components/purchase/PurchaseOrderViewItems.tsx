import React from "react";
import { FileText, FolderOpen } from "lucide-react";
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
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
            <span>Draft</span>
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
      return (
        <Badge
          variant="outline"
          className="rounded-lg text-[10.5px] font-bold px-2.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 whitespace-nowrap select-none"
        >
          Cancelled
        </Badge>
      );
    case "DRAFT":
    default:
      return (
        <Badge
          variant="outline"
          className="rounded-lg text-[10.5px] font-bold px-2.5 py-0.5 bg-muted text-muted-foreground border-border/80 whitespace-nowrap select-none"
        >
          Draft
        </Badge>
      );
  }
};

interface PurchaseOrderViewProps {
  po: PurchaseOrderItem;
  onDetail: (po: PurchaseOrderItem) => void;
}

export const PurchaseOrderGridCard: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
}) => {
  return (
    <Card
      onClick={() => onDetail(po)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          {/* Header */}
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

          {/* Option 1: Tag Chips Preview */}
          <div className="space-y-1.5 min-h-14.5 flex flex-col justify-start">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold">Materials Configured</span>
              <span className="font-semibold">
                {po.items.length} {po.items.length > 1 ? "materials" : "material"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {po.items.slice(0, 2).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 text-foreground px-2 py-0.5 rounded-lg border border-border/50 max-w-full truncate"
                >
                  <span className="truncate">{item.ingredient_name}</span>
                  <span className="font-mono text-muted-foreground shrink-0 text-[10px]">
                    ({formatNumber(item.quantity)} {item.unit})
                  </span>
                </span>
              ))}
              {po.items.length > 2 && (
                <span className="inline-flex items-center text-[10.5px] font-bold text-primary bg-primary/10 border border-primary/25 px-1.5 py-0.5 rounded-lg whitespace-nowrap">
                  +{po.items.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Total Cost - Consistent with Master Data */}
          <div className="flex items-baseline justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-muted-foreground text-xs font-medium">
              Total Cost:
            </span>
            <span className="text-base font-extrabold text-foreground font-mono">
              {formatRupiah(po.total_amount)}
            </span>
          </div>
        </div>

        {/* Master Data Style Footer with Open Button */}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PurchaseOrderTableRow: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
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
        <span className="font-bold text-foreground truncate block max-w-48">
          {po.supplier_name}
        </span>
      </td>
      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap hidden sm:table-cell">
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
      <td className="py-2.5 px-3 text-center whitespace-nowrap hidden lg:table-cell">
        <PurchaseStatusBadge status={po.status} isTable={true} />
      </td>
      <td
        className="py-2.5 px-3 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDetail(po)}
          className="h-7.5 px-2.5 rounded-lg text-xs font-semibold gap-1.5 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs transition-all active:scale-95"
          title="View Details"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Detail</span>
        </Button>
      </td>
    </tr>
  );
};

export const PurchaseOrderMobileCard: React.FC<PurchaseOrderViewProps> = ({
  po,
  onDetail,
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
      </div>
    </Card>
  );
};



