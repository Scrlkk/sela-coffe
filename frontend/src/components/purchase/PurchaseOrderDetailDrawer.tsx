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
  Receipt,
  Truck,
  Package,
  PackageCheck,
  Ban,
  Trash2,
  RotateCcw,
  X,
  ClipboardList,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { PurchaseOrderItem } from "@/services/purchase";

interface PurchaseOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderItem | null;
  onReceive?: (po: PurchaseOrderItem) => void;
  onCancel?: (po: PurchaseOrderItem) => void;
  onDelete?: (po: PurchaseOrderItem) => void;
  onRestore?: (po: PurchaseOrderItem) => void;
}

export const PurchaseOrderDetailDrawer: React.FC<
  PurchaseOrderDetailDrawerProps
> = ({
  isOpen,
  onClose,
  purchaseOrder: po,
  onReceive,
  onCancel,
  onDelete,
  onRestore,
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [cachedPo, setCachedPo] = useState<PurchaseOrderItem | null>(po);
  const [prevPo, setPrevPo] = useState<PurchaseOrderItem | null>(po);

  if (po !== prevPo) {
    setPrevPo(po);
    if (po) setCachedPo(po);
  }

  const displayPo = po || cachedPo;
  const isDeleted = Boolean(displayPo?.isDeleted);
  const isPending = displayPo?.status === "PENDING" && !isDeleted;

  return (
    <Drawer
      open={isOpen && Boolean(displayPo)}
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
        {displayPo && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-card">
            <DrawerHeader className="px-4 sm:px-5 py-3.5 border-b border-border/60 bg-card shrink-0 text-left">
              <div className="flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 text-left">
                    <DrawerTitle className="text-base font-bold text-foreground font-mono text-left">
                      {displayPo.po_number}
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground line-clamp-1 text-left">
                      Procurement order breakdown & status tracking
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
              <div className="bg-background/50 border border-border/70 rounded-2xl px-3.5 py-3 flex items-center justify-between gap-3 shadow-2xs min-h-11">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <ClipboardList className="w-3.5 h-3.5 text-primary" />
                    <span>Order Status</span>
                  </span>

                  <div
                    key={displayPo.status}
                    className="flex items-center gap-1.5 animate-in fade-in-50 zoom-in-95 duration-300"
                  >
                    {displayPo.status === "PENDING" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    )}
                    <span
                      className={
                        displayPo.status === "PENDING"
                          ? "text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase leading-none"
                          : displayPo.status === "RECEIVED"
                            ? "text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase leading-none"
                            : "text-xs font-bold font-mono text-destructive uppercase leading-none"
                      }
                    >
                      {displayPo.status}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-muted-foreground truncate flex items-center gap-1 shrink-0">
                  <span className="text-[11px] text-muted-foreground/80 font-normal">
                    By:
                  </span>
                  <span className="text-foreground font-bold truncate">
                    {displayPo.created_by || "Admin Sela"}
                  </span>
                </div>
              </div>

              <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    <span>Vendor & Schedule</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">
                      Vendor / Supplier
                    </span>
                    <div className="p-2.5 rounded-xl bg-card border border-border/70">
                      <span
                        className="font-semibold text-foreground block text-xs sm:text-sm truncate"
                        title={displayPo.supplier_name}
                      >
                        {displayPo.supplier_name}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-foreground">
                        Order Date
                      </span>
                      <div className="p-2.5 rounded-xl bg-card border border-border/70">
                        <span className="font-semibold text-foreground block text-xs sm:text-sm">
                          {formatDate(displayPo.order_date)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-foreground">
                        Expected Delivery
                      </span>
                      <div className="p-2.5 rounded-xl bg-card border border-border/70">
                        <span className="font-semibold text-foreground block text-xs sm:text-sm">
                          {displayPo.expected_date
                            ? formatDate(displayPo.expected_date)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {displayPo.notes && (
                    <div className="space-y-1 pt-1 border-t border-border/40">
                      <span className="text-xs font-bold text-foreground">
                        Notes / Reference
                      </span>
                      <div className="p-2.5 rounded-xl bg-card border border-border/70">
                        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                          {displayPo.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background/50 border border-border/70 rounded-2xl p-3.5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span>Ordered Materials</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {displayPo.items.length} in list
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 divide-y divide-dashed divide-border/60">
                  {displayPo.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0.5 last:pb-0.5 space-y-1"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                          {item.ingredient_name}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-foreground shrink-0 text-right">
                          {formatRupiah(
                            item.subtotal || item.quantity * item.unit_cost,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                          {formatNumber(item.quantity)} {item.unit} × @
                          {formatRupiah(item.unit_cost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Total Order Valuation
                    </span>
                    <span className="text-[10.5px] text-muted-foreground">
                      {displayPo.items.length} material
                      {displayPo.items.length !== 1 ? "s" : ""} in order
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base sm:text-lg font-black text-primary block">
                      {formatRupiah(displayPo.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DrawerFooter
              key={`footer-${displayPo.status}-${isDeleted}`}
              className="px-4 sm:px-5 py-3 border-t border-border/80 bg-card shrink-0 grid grid-cols-2 gap-2.5 w-full animate-in fade-in-50 zoom-in-95 duration-300"
            >
              {isPending ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onCancel?.(displayPo)}
                    className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold text-xs sm:text-sm gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Cancel PO</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => onReceive?.(displayPo)}
                    className="w-full h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Receive Order</span>
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    {!isDeleted && onDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          onClose();
                          onDelete(displayPo);
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
                          onRestore(displayPo);
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
                </>
              )}
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PurchaseOrderDetailDrawer;
