import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageCheck, Truck, Sparkles } from "lucide-react";
import { formatNumber } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { PurchaseOrderItem } from "@/services/purchase";

interface ReceiveGoodsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderItem | null;
  onConfirmReceive: (
    poId: string,
    receivedItems: { ingredient_id: string; received_quantity: number }[],
    notes?: string,
  ) => void;
}

interface ReceiveGoodsFormProps {
  po: PurchaseOrderItem;
  onClose: () => void;
  onConfirm: (
    poId: string,
    receivedItems: { ingredient_id: string; received_quantity: number }[],
    notes?: string,
  ) => void;
}

const ReceiveGoodsForm: React.FC<ReceiveGoodsFormProps> = ({
  po,
  onClose,
  onConfirm,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    po.items.forEach((item) => {
      initial[item.ingredient_id] = item.quantity;
    });
    return initial;
  });

  const [receiveNote, setReceiveNote] = useState("");

  const handleQuantityChange = (ingredientId: string, val: string) => {
    const num = Math.max(0, Number(val) || 0);
    setQuantities((prev) => ({ ...prev, [ingredientId]: num }));
  };

  const totalReceived = Object.values(quantities).reduce(
    (sum, val) => sum + val,
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = po.items.map((item) => ({
      ingredient_id: item.ingredient_id,
      received_quantity: quantities[item.ingredient_id] ?? item.quantity,
    }));

    onConfirm(po.id, payload, receiveNote.trim() || undefined);
  };

  return (
    <>
      <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Receive Goods
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm incoming shipment for {po.po_number}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Order Header Summary */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-foreground block">
                {po.supplier_name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Ordered: {formatDate(po.order_date)}
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="font-bold text-primary">{po.po_number}</span>
          </div>
        </div>

        {/* Item Receipt Table */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">
            Verify Received Quantities
          </Label>

          <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40 bg-card">
            {po.items.map((item) => (
              <div
                key={item.ingredient_id}
                className="p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground truncate">
                    {item.ingredient_name}
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Ordered: {formatNumber(item.quantity)} {item.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-28 relative">
                    <Input
                      type="number"
                      min="0"
                      value={quantities[item.ingredient_id] ?? item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.ingredient_id,
                          e.target.value,
                        )
                      }
                      className="h-8.5 text-xs font-mono font-bold rounded-xl pr-7"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-semibold">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">
            Receiving Remarks / Notes
          </Label>
          <Input
            placeholder="e.g. All items inspected in good condition"
            value={receiveNote}
            onChange={(e) => setReceiveNote(e.target.value)}
            className="h-9.5 rounded-xl border-border/80 text-xs text-foreground bg-card"
          />
        </div>

        {/* Auto Stock Sync Alert */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Automated Inventory Synchronization
            </span>
            <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
              Confirming this receipt will automatically add{" "}
              <strong>{formatNumber(totalReceived)} items</strong> into raw
              materials stock and record an incoming log (
              <code>IN</code>) in Stock Movement.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9.5 rounded-xl border-border/80 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={totalReceived <= 0}
            className="h-9.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Confirm & Update Stock</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const ReceiveGoodsDialog: React.FC<ReceiveGoodsDialogProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onConfirmReceive,
}) => {
  if (!purchaseOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {isOpen && (
          <ReceiveGoodsForm
            key={purchaseOrder.id}
            po={purchaseOrder}
            onClose={onClose}
            onConfirm={(id, items, note) => {
              onConfirmReceive(id, items, note);
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveGoodsDialog;
