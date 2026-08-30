import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  ReceiptText,
  User,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { TransactionItem, PaymentMethod } from "@/services/transaction";

export const PaymentMethodBadge: React.FC<{
  method: PaymentMethod;
  className?: string;
}> = ({ method, className }) => {
  switch (method) {
    case "cash":
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap select-none ${className || ""}`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Cash</span>
        </span>
      );
    case "qris":
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap select-none ${className || ""}`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QRIS</span>
        </span>
      );
    case "card":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap select-none ${className || ""}`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card</span>
        </span>
      );
  }
};

interface TransactionDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
  onDelete?: (trx: TransactionItem) => void;
  onRestore?: (trx: TransactionItem) => void;
}

export const TransactionDetailDrawer: React.FC<
  TransactionDetailDrawerProps
> = ({ isOpen, onClose, transaction: trx, onDelete, onRestore }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [cachedTrx, setCachedTrx] = useState<TransactionItem | null>(trx);
  const [prevTrx, setPrevTrx] = useState<TransactionItem | null>(trx);

  if (trx !== prevTrx) {
    setPrevTrx(trx);
    if (trx) setCachedTrx(trx);
  }

  const displayTrx = trx || cachedTrx;
  const isDeleted = Boolean(displayTrx?.isDeleted);

  return (
    <Drawer
      open={isOpen && Boolean(displayTrx)}
      onOpenChange={(open) => !open && onClose()}
      swipeDirection={isDesktop ? "right" : "down"}
      showSwipeHandle
    >
      <DrawerContent
        className={
          isDesktop
            ? "w-full sm:w-130 lg:w-145 max-w-[100vw] h-full inset-y-0 right-0 rounded-l-3xl border-l border-border/80 bg-card flex flex-col shadow-2xl"
            : "w-full max-w-xl mx-auto rounded-t-3xl border-t border-border/80 bg-card max-h-[90vh] flex flex-col shadow-2xl bottom-0"
        }
      >
        {displayTrx && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-card">
            <DrawerHeader className="px-4 sm:px-5 py-3.5 border-b border-border/60 bg-card shrink-0 text-left">
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 text-left">
                    <DrawerTitle className="text-base font-bold text-foreground font-mono text-left">
                      {displayTrx.invoice_number}
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground line-clamp-1 text-left">
                      Sales invoice breakdown & payment details
                    </DrawerDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="w-7.5 h-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-5 py-3.5 space-y-3.5 bg-card">
              <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Transaction Meta</span>
                  </span>
                  <PaymentMethodBadge method={displayTrx.payment_method} />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">
                      Cashier Staff
                    </span>
                    <div className="p-2.5 rounded-xl bg-card border border-border/70">
                      <span className="font-semibold text-foreground block text-xs sm:text-sm truncate">
                        {displayTrx.cashier_name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">
                      Date & Time
                    </span>
                    <div className="p-2.5 rounded-xl bg-card border border-border/70">
                      <span className="font-semibold text-foreground block text-xs sm:text-sm font-mono">
                        {formatDateTime(displayTrx.created_at)}
                      </span>
                    </div>
                  </div>

                  {displayTrx.notes && (
                    <div className="space-y-1 col-span-2 pt-1 border-t border-border/40">
                      <span className="text-xs font-bold text-foreground">
                        Notes / Reference
                      </span>
                      <div className="p-2.5 rounded-xl bg-card border border-border/70">
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                          {displayTrx.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                    <span>Ordered Items</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {displayTrx.items.reduce(
                      (acc, curr) => acc + curr.quantity,
                      0,
                    )}{" "}
                    items
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 divide-y divide-dashed divide-border/60">
                  {displayTrx.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0.5 last:pb-0.5 space-y-1"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                          {item.product_name}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-foreground shrink-0 text-right">
                          {formatRupiah(
                            item.subtotal || item.quantity * item.price,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                          {formatNumber(item.quantity)}x @
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatRupiah(displayTrx.subtotal)}
                    </span>
                  </div>

                  {displayTrx.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span className="font-mono font-semibold">
                        -{formatRupiah(displayTrx.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>PB1 Tax (10%)</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatRupiah(displayTrx.tax)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                        Total Amount Due
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {displayTrx.items.length} item line
                        {displayTrx.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base sm:text-lg font-black text-primary block">
                        {formatRupiah(displayTrx.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 space-y-1 text-muted-foreground">
                    <div className="flex justify-between font-medium text-foreground">
                      <span>Amount Tendered / Paid</span>
                      <span className="font-mono">
                        {formatRupiah(displayTrx.paid_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold text-sm pt-0.5">
                      <span>Change Given</span>
                      <span className="font-mono">
                        {formatRupiah(displayTrx.change_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter
              key={`footer-${isDeleted}`}
              className="px-4 sm:px-5 py-3 border-t border-border/80 bg-card shrink-0 grid grid-cols-2 gap-2.5 w-full animate-in fade-in-50 zoom-in-95 duration-300"
            >
              <div>
                {!isDeleted && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onDelete(displayTrx);
                    }}
                    className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-destructive hover:bg-destructive/10 font-semibold text-xs sm:text-sm gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Trash</span>
                  </Button>
                )}

                {isDeleted && onRestore && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onRestore(displayTrx);
                    }}
                    className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-emerald-600 hover:bg-emerald-500/10 font-semibold text-xs sm:text-sm gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-foreground font-semibold text-xs sm:text-sm cursor-pointer hover:bg-secondary/60 transition-all active:scale-95"
              >
                Close
              </Button>
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionDetailDrawer;
