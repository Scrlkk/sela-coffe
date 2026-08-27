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
  FileSpreadsheet,
  Truck,
  Calendar,
  Package,
  PackageCheck,
  Clock,
  Ban,
  Trash2,
  RotateCcw,
  FileText,
  X,
  DollarSign,
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
  if (po && po !== cachedPo) {
    setCachedPo(po);
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
            ? "w-full sm:w-155 lg:w-180 max-w-[100vw] h-full inset-y-0 right-0 rounded-l-3xl border-l border-border/80 bg-background flex flex-col shadow-2xl"
            : "w-full max-w-2xl mx-auto rounded-t-3xl border-t border-border/80 bg-background max-h-[90vh] flex flex-col shadow-2xl bottom-0"
        }
      >
        {displayPo && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
            {/* Header */}
            <DrawerHeader className="px-5 sm:px-7 py-3.5 sm:py-4 border-b border-border/80 bg-card/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <DrawerTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 truncate">
                      <span className="truncate">{displayPo.po_number}</span>
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground truncate">
                      Procurement breakdown & delivery tracking
                    </DrawerDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DrawerHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-7 py-4 space-y-4">
              {/* Metadata Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    Vendor
                  </span>
                  <span className="font-bold text-foreground block text-xs sm:text-sm truncate">
                    {displayPo.supplier_name}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Order Date
                  </span>
                  <span className="font-bold text-foreground block text-xs sm:text-sm">
                    {formatDate(displayPo.order_date)}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Expected
                  </span>
                  <span className="font-bold text-foreground block text-xs sm:text-sm">
                    {displayPo.expected_date
                      ? formatDate(displayPo.expected_date)
                      : "—"}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Received
                  </span>
                  <span className="font-bold text-foreground block text-xs sm:text-sm">
                    {displayPo.received_date
                      ? formatDate(displayPo.received_date)
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Line Items Breakdown Table */}
              <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Ordered Materials ({displayPo.items.length})</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2.5 px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 rounded-xl">
                    <div className="col-span-5">Material Name</div>
                    <div className="col-span-2 text-center">Ordered</div>
                    {displayPo.status === "RECEIVED" ? (
                      <div className="col-span-2 text-center">Received</div>
                    ) : (
                      <div className="col-span-2 text-right">Unit Cost</div>
                    )}
                    <div className="col-span-3 text-right pr-2">Subtotal</div>
                  </div>

                  {displayPo.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-2.5 rounded-xl bg-background/70 border border-border/70 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center text-xs hover:border-primary/40 transition-colors shadow-2xs"
                    >
                      <div className="sm:col-span-5 min-w-0 pr-2">
                        <span className="font-bold text-foreground block truncate text-xs sm:text-sm">
                          {item.ingredient_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          @ {formatRupiah(item.unit_cost)} / {item.unit}
                        </span>
                      </div>

                      <div className="sm:col-span-2 text-left sm:text-center font-mono font-semibold text-foreground text-xs">
                        <span className="sm:hidden text-muted-foreground font-sans mr-1">
                          Ordered:
                        </span>
                        {formatNumber(item.quantity)} {item.unit}
                      </div>

                      {displayPo.status === "RECEIVED" ? (
                        <div className="sm:col-span-2 text-left sm:text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          <span className="sm:hidden text-muted-foreground font-sans mr-1">
                            Received:
                          </span>
                          {formatNumber(
                            item.received_quantity ?? item.quantity,
                          )}{" "}
                          {item.unit}
                        </div>
                      ) : (
                        <div className="sm:col-span-2 hidden sm:block text-right font-mono text-xs text-muted-foreground">
                          {formatRupiah(item.unit_cost)}
                        </div>
                      )}

                      <div className="sm:col-span-3 flex items-center justify-between sm:justify-end pt-1.5 sm:pt-0 border-t border-border/40 sm:border-0 font-mono font-bold text-foreground text-xs sm:text-sm">
                        <span className="sm:hidden font-sans text-xs text-muted-foreground font-medium">
                          Subtotal:
                        </span>
                        <span>{formatRupiah(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valuation Summary */}
              <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground block">
                      Total Order Valuation
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {displayPo.items.length} materials configured
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg sm:text-xl font-black text-primary block tracking-tight">
                    {formatRupiah(displayPo.total_amount)}
                  </span>
                </div>
              </div>

              {/* Notes if any */}
              {displayPo.notes && (
                <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1.5 shadow-xs">
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes / Reference
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-5.5">
                    {displayPo.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <DrawerFooter className="px-5 sm:px-7 py-3.5 sm:py-4 border-t border-border/80 bg-card/90 backdrop-blur-md shrink-0 flex flex-row flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isPending && onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onCancel(displayPo);
                    }}
                    className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel PO</span>
                  </Button>
                )}

                {!isDeleted && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onDelete(displayPo);
                    }}
                    className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Trash</span>
                  </Button>
                )}

                {isDeleted && onRestore && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onRestore(displayPo);
                    }}
                    className="h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-9 px-4 rounded-xl border-border/80 text-xs font-semibold cursor-pointer bg-background hover:bg-secondary/60"
                >
                  Close
                </Button>

                {isPending && onReceive && (
                  <Button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReceive(displayPo);
                    }}
                    className="h-9 px-4.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-2 shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Receive Order</span>
                  </Button>
                )}
              </div>
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PurchaseOrderDetailDrawer;
