import React, { useState } from "react";
import type { StockItem, StockLogType } from "@/services/stock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ChevronDown,
  Check,
  ArrowDownUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatCurrency";

interface StockAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockItem[];
  initialStockItem?: StockItem | null;
  onConfirm: (payload: {
    product_id: string;
    type: StockLogType;
    quantity: number;
    note?: string;
  }) => void;
}

const PRESET_REASONS: { label: string; type: StockLogType }[] = [
  { label: "Supplier Delivery", type: "in" },
  { label: "Direct Purchase", type: "in" },
  { label: "Sample & Bonus", type: "in" },
  { label: "Branch Transfer In", type: "in" },
  { label: "Kitchen Return", type: "in" },
  { label: "Shift Usage", type: "out" },
  { label: "Grinder Calibration", type: "out" },
  { label: "Waste & Spoilage", type: "out" },
  { label: "Expired & Damage", type: "out" },
  { label: "Staff Meal / Tasting", type: "out" },
  { label: "Closing Opname", type: "adjustment" },
  { label: "Shift Handover", type: "adjustment" },
  { label: "Audit Recount", type: "adjustment" },
  { label: "Storage Relocation", type: "adjustment" },
  { label: "Correction Count", type: "adjustment" },
];

const ADJUSTMENT_TYPES: {
  id: StockLogType;
  label: string;
  icon: typeof ArrowDownLeft;
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    id: "in",
    label: "Restock",
    icon: ArrowDownLeft,
    activeClass: "bg-emerald-600 text-white shadow-xs",
    hoverClass:
      "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10",
  },
  {
    id: "out",
    label: "Reduce",
    icon: ArrowUpRight,
    activeClass: "bg-rose-600 text-white shadow-xs",
    hoverClass:
      "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10",
  },
  {
    id: "adjustment",
    label: "Opname",
    icon: ArrowDownUp,
    activeClass: "bg-primary text-primary-foreground shadow-xs",
    hoverClass: "text-muted-foreground hover:text-primary hover:bg-primary/10",
  },
];

const StockAdjustmentForm: React.FC<{
  stocks: StockItem[];
  initialStockItem?: StockItem | null;
  onClose: () => void;
  onConfirm: (payload: {
    product_id: string;
    type: StockLogType;
    quantity: number;
    note?: string;
  }) => void;
}> = ({ stocks, initialStockItem, onClose, onConfirm }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialStockItem?.product_id || stocks[0]?.product_id || "",
  );
  const [adjustmentType, setAdjustmentType] = useState<StockLogType>("in");
  const [quantity, setQuantity] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const currentStock =
    stocks.find((s) => s.product_id === selectedProductId) ||
    initialStockItem ||
    stocks[0];
  const currentQty = currentStock?.quantity ?? 0;
  const numQty = Math.max(0, parseInt(quantity, 10) || 0);
  const isOutOfStock = currentQty === 0;

  if (isOutOfStock && adjustmentType === "out") {
    setAdjustmentType("in");
  }

  const newQty =
    adjustmentType === "in"
      ? currentQty + numQty
      : adjustmentType === "out"
        ? Math.max(0, currentQty - numQty)
        : numQty;

  const difference = newQty - currentQty;
  const isValid =
    Boolean(selectedProductId) &&
    numQty > 0 &&
    !(adjustmentType === "out" && isOutOfStock) &&
    !(adjustmentType === "out" && numQty > currentQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirm({
      product_id: selectedProductId,
      type: adjustmentType,
      quantity: numQty,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Stock Adjustment
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Adjust raw material quantity, restock, or count.
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <Label className="font-bold text-foreground">Raw Material</Label>
            <span className="text-[11px] text-muted-foreground font-medium">
              Current:{" "}
              <strong className="text-foreground font-bold font-mono">
                {formatNumber(currentQty)} {currentStock?.unit || "units"}
              </strong>
            </span>
          </div>

          {initialStockItem ? (
            <div className="p-2.5 rounded-xl border border-border/80 bg-muted/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-xs sm:text-sm truncate leading-tight">
                    {currentStock?.product_name}
                  </h4>
                  <span className="text-[10.5px] text-muted-foreground block truncate">
                    {currentStock?.category_name}
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-card text-muted-foreground border border-border/60 shrink-0">
                Fixed
              </span>
            </div>
          ) : (
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger className="w-full">
                <div className="w-full h-9.5 sm:h-10 px-3 rounded-xl border border-input bg-card text-foreground text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer hover:border-primary/60 transition-colors select-none">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground truncate">
                      {currentStock?.product_name || "Select Raw Material"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-full min-w-full max-w-full max-h-48 overflow-y-auto no-scrollbar p-1 rounded-xl bg-card border border-border/80 shadow-lg z-50 divide-y divide-border/30"
              >
                {stocks.map((item) => {
                  const isSelected = item.product_id === selectedProductId;
                  return (
                    <DropdownMenuItem
                      key={item.product_id}
                      onClick={() => {
                        setSelectedProductId(item.product_id);
                        if (item.quantity === 0 && adjustmentType === "out") {
                          setAdjustmentType("in");
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-xs",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "hover:bg-muted/60 text-foreground",
                      )}
                    >
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <span className="font-bold text-foreground truncate text-xs">
                          {item.product_name}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground truncate">
                          {item.category_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground font-mono font-medium">
                          {formatNumber(item.quantity)} {item.unit}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">
            Adjustment Type
          </Label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60">
            {ADJUSTMENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isOutDisabled = type.id === "out" && isOutOfStock;
              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={isOutDisabled}
                  onClick={() => {
                    if (isOutDisabled) return;
                    setAdjustmentType(type.id);
                    if (type.id === "out" && numQty > currentQty) {
                      setQuantity(String(currentQty));
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold transition-all gap-1.5 select-none",
                    isOutDisabled
                      ? "opacity-35 cursor-not-allowed text-muted-foreground"
                      : adjustmentType === type.id
                        ? type.activeClass
                        : type.hoverClass + " cursor-pointer",
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <Label htmlFor="stock-qty" className="font-bold text-foreground">
              {adjustmentType === "in"
                ? "Quantity to Restock (+)"
                : adjustmentType === "out"
                  ? "Quantity to Deduct / Usage (-)"
                  : "Physical Count Quantity"}
            </Label>
            <span className="text-muted-foreground font-mono">
              Unit: {currentStock?.unit}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Input
                id="stock-qty"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/\D/g, "");
                  if (cleanVal === "") {
                    setQuantity("");
                    return;
                  }
                  const parsed = parseInt(cleanVal, 10);
                  if (
                    adjustmentType === "out" &&
                    !isNaN(parsed) &&
                    parsed > currentQty
                  ) {
                    setQuantity(String(currentQty));
                  } else {
                    setQuantity(String(parsed));
                  }
                }}
                placeholder="0"
                required
                className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-sm font-bold pl-3 pr-12 focus-visible:ring-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                {currentStock?.unit}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {[5, 10, 20].map((stepVal) => {
                const isStepDisabled =
                  adjustmentType === "out" && stepVal > currentQty;
                return (
                  <Button
                    key={stepVal}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isStepDisabled}
                    onClick={() => setQuantity(String(stepVal))}
                    className={cn(
                      "h-9.5 sm:h-10 px-2.5 rounded-xl text-xs font-bold hover:border-primary/60 cursor-pointer bg-card",
                      isStepDisabled &&
                        "opacity-35 cursor-not-allowed hover:border-border",
                    )}
                  >
                    {adjustmentType === "out" ? `-${stepVal}` : `+${stepVal}`}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs shadow-2xs">
          <span className="text-muted-foreground font-semibold text-[11px]">
            Resulting Balance:
          </span>
          <div className="flex items-center gap-1.5 font-bold font-mono">
            <span className="text-muted-foreground/70 line-through text-[11px]">
              {formatNumber(currentQty)}
            </span>
            <span className="text-muted-foreground text-xs">→</span>
            <span
              className={cn(
                "text-xs sm:text-sm font-extrabold",
                difference > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : difference < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground",
              )}
            >
              {formatNumber(newQty)} {currentStock?.unit}
            </span>
            <span
              className={cn(
                "text-[10.5px] px-1.5 py-0.5 rounded font-semibold",
                difference > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : difference < 0
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {difference > 0
                ? `+${formatNumber(difference)}`
                : formatNumber(difference)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="stock-note"
            className="text-xs font-bold text-foreground"
          >
            Reason / Operational Note
          </Label>
          <Input
            id="stock-note"
            placeholder="e.g. End-of-shift bar usage, grinder calibration, invoice..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-medium focus-visible:ring-primary"
          />

          <div className="space-y-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_REASONS.filter((p) => p.type === adjustmentType)
                .slice(0, 4)
                .map((preset) => {
                  const isActive = note === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNote(isActive ? "" : preset.label)}
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none active:scale-95",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                          : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/50",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
            </div>
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
            disabled={!isValid}
            className="h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Adjustment
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  isOpen,
  onClose,
  stocks,
  initialStockItem,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isOpen && (
          <StockAdjustmentForm
            key={initialStockItem ? initialStockItem.id : "any"}
            stocks={stocks}
            initialStockItem={initialStockItem}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentDialog;
