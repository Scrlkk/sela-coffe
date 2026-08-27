import React, { useState } from "react";
import type { StockItem } from "@/services/stock";
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
import { Settings2, ShieldAlert } from "lucide-react";

interface StockLimitsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem: StockItem | null;
  onSave: (
    productId: string,
    limits: { min_stock: number; max_stock: number },
  ) => void;
}

interface StockLimitsFormProps {
  stockItem: StockItem;
  onClose: () => void;
  onSave: (
    productId: string,
    limits: { min_stock: number; max_stock: number },
  ) => void;
}

const StockLimitsDialogForm: React.FC<StockLimitsFormProps> = ({
  stockItem,
  onClose,
  onSave,
}) => {
  const [minStock, setMinStock] = useState<string>(
    String(stockItem.min_stock ?? 5),
  );
  const [maxStock, setMaxStock] = useState<string>(
    String(stockItem.max_stock ?? 100),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = Math.max(0, parseInt(minStock, 10) || 0);
    const maxVal = Math.max(minVal, parseInt(maxStock, 10) || 100);

    onSave(stockItem.product_id, {
      min_stock: minVal,
      max_stock: maxVal,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Stock Alert Thresholds
          </DialogTitle>
          <DialogDescription className="truncate text-xs sm:text-sm text-muted-foreground max-w-50 sm:max-w-xs">
            {stockItem.product_name} ({stockItem.category_name})
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="p-2.5 sm:p-3 bg-muted/40 border border-border/60 rounded-xl flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            When stock reaches or drops below{" "}
            <strong className="text-foreground">Min Stock</strong>, a low stock
            warning badge will be triggered.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="space-y-1">
            <Label
              htmlFor="min-stock"
              className="text-xs font-bold text-foreground"
            >
              Min Alert ({stockItem.unit})
            </Label>
            <Input
              id="min-stock"
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="max-stock"
              className="text-xs font-bold text-foreground"
            >
              Max Capacity ({stockItem.unit})
            </Label>
            <Input
              id="max-stock"
              type="number"
              min="1"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-bold"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 sm:pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9.5 sm:h-10 rounded-xl border-border/80 text-foreground font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
          >
            Save Thresholds
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const StockLimitsDialog: React.FC<StockLimitsDialogProps> = ({
  isOpen,
  onClose,
  stockItem,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isOpen && stockItem && (
          <StockLimitsDialogForm
            key={stockItem.id}
            stockItem={stockItem}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockLimitsDialog;
