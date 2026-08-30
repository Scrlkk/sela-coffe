import React from "react";
import { FolderOpen, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { formatDateTime, formatDate, formatTime } from "@/utils/formatDate";
import type { TransactionItem } from "@/services/transaction";
import { PaymentMethodBadge } from "./TransactionDetailDrawer";

export { PaymentMethodBadge };

interface TransactionViewProps {
  transaction: TransactionItem;
  onDetail: (trx: TransactionItem) => void;
  onDelete?: (trx: TransactionItem) => void;
  onRestore?: (trx: TransactionItem) => void;
}

export const TransactionGridCard: React.FC<TransactionViewProps> = ({
  transaction: trx,
  onDetail,
  onDelete,
  onRestore,
}) => {
  const totalItemsCount = trx.items.reduce(
    (acc, curr) => acc + curr.quantity,
    0,
  );

  return (
    <Card
      onClick={() => onDetail(trx)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
    >
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="font-mono text-[11px] font-bold text-primary tracking-tight">
                {trx.invoice_number}
              </span>
              <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                {trx.cashier_name}
              </h3>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <PaymentMethodBadge method={trx.payment_method} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="font-semibold">
                {formatDate(trx.created_at)}
              </span>
              <span className="font-semibold font-mono">
                {totalItemsCount} {totalItemsCount > 1 ? "items" : "item"}
              </span>
            </div>

            <div className="space-y-1 min-h-11 flex flex-col justify-center">
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span
                    className="font-medium text-foreground truncate"
                    title={trx.items[0]?.product_name}
                  >
                    {trx.items[0]?.product_name || "No item"}
                  </span>
                </div>
                {trx.items[0] && (
                  <span className="font-mono text-[10.5px] text-muted-foreground shrink-0">
                    ({trx.items[0].quantity}x)
                  </span>
                )}
              </div>

              {trx.items.length > 1 ? (
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span
                      className="font-medium text-foreground truncate"
                      title={trx.items[1]?.product_name}
                    >
                      {trx.items[1]?.product_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono text-[10.5px] text-muted-foreground">
                      ({trx.items[1].quantity}x)
                    </span>
                    {trx.items.length > 2 && (
                      <span className="inline-flex items-center text-[10px] font-bold text-primary bg-primary/10 border border-primary/25 px-1 py-0.2 rounded-md whitespace-nowrap">
                        +{trx.items.length - 2} more
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
                Total Paid:
              </span>
              <span className="text-sm font-extrabold text-foreground font-mono">
                {formatRupiah(trx.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-muted-foreground font-medium block">
              Waktu Transaksi
            </span>
            <span className="font-mono text-[11px] font-semibold text-foreground block truncate">
              {formatDate(trx.created_at)} • {formatTime(trx.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {trx.isDeleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.(trx);
                }}
                className="h-7.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
                title="Restore Transaction"
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
                      onDelete(trx);
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
                    onDetail(trx);
                  }}
                  className="h-7.5 px-2.5 rounded-lg text-xs font-semibold gap-1.5 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs transition-all active:scale-95"
                  title="Open Transaction Details"
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

export const TransactionTableRow: React.FC<TransactionViewProps> = ({
  transaction: trx,
  onDetail,
  onDelete,
  onRestore,
}) => {
  return (
    <tr
      onClick={() => onDetail(trx)}
      className="group hover:bg-muted/40 transition-colors cursor-pointer text-xs"
    >
      <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
        {trx.invoice_number}
      </td>
      <td className="py-2.5 px-3 text-muted-foreground text-xs font-medium whitespace-nowrap">
        {formatDateTime(trx.created_at)}
      </td>
      <td className="py-2.5 px-3">
        <span className="font-bold text-foreground block truncate max-w-40">
          {trx.cashier_name}
        </span>
      </td>
      <td className="py-2.5 px-3 whitespace-nowrap">
        <PaymentMethodBadge method={trx.payment_method} />
      </td>
      <td className="py-2.5 px-3 hidden lg:table-cell">
        <div className="leading-tight min-w-0">
          <span className="font-medium text-foreground truncate block max-w-48">
            {trx.items[0]?.product_name || "-"}
            {trx.items[0] && ` (${formatNumber(trx.items[0].quantity)}x)`}
          </span>
          {trx.items.length > 1 && (
            <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
              +{trx.items.length - 1} other item
              {trx.items.length > 2 ? "s" : ""}
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-3 font-mono font-bold text-foreground whitespace-nowrap text-right">
        {formatRupiah(trx.total_amount)}
      </td>
      <td
        className="py-2.5 px-3 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1">
          {trx.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore?.(trx)}
              className="h-7.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
              title="Restore Transaction"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDetail(trx)}
                className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="View Details"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(trx)}
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

export const TransactionMobileCard: React.FC<TransactionViewProps> = ({
  transaction: trx,
  onDetail,
  onDelete,
  onRestore,
}) => {
  return (
    <Card
      onClick={() => onDetail(trx)}
      className="border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground p-3.5 space-y-2.5 select-none cursor-pointer hover:border-primary transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[11px] font-bold text-primary">
            {trx.invoice_number}
          </span>
          <h4 className="text-xs font-bold text-foreground line-clamp-1">
            {trx.cashier_name}
          </h4>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <PaymentMethodBadge method={trx.payment_method} />
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1 text-xs">
        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
          <span>{formatDateTime(trx.created_at)}</span>
          <span className="font-semibold font-mono">
            {trx.items.length} item line{trx.items.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center justify-between font-mono pt-1 border-t border-border/40">
          <span className="text-muted-foreground text-[11px] font-sans">
            Total:
          </span>
          <span className="font-bold text-foreground">
            {formatRupiah(trx.total_amount)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">
          Tap card for details
        </span>
        <div className="flex items-center gap-1">
          {trx.isDeleted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onRestore?.(trx);
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
                    onDelete(trx);
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
                  onDetail(trx);
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
