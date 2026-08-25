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
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface StockAdjustmentFormProps {
  stocks: StockItem[];
  initialStockItem?: StockItem | null;
  onClose: () => void;
  onConfirm: (payload: {
    product_id: string;
    type: StockLogType;
    quantity: number;
    note?: string;
  }) => void;
}

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({
  stocks,
  initialStockItem,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialStockItem?.product_id || stocks[0]?.product_id || "",
  );
  const [adjustmentType, setAdjustmentType] = useState<StockLogType>("in");
  const [quantity, setQuantity] = useState<string>("10");
  const [note, setNote] = useState<string>("");

  const isItemLocked = Boolean(initialStockItem);

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

  const handleSelectAdjustmentType = (type: StockLogType) => {
    if (type === "out" && isOutOfStock) return;
    setAdjustmentType(type);
    if (type === "out" && numQty > currentQty) {
      setQuantity(String(currentQty));
    }
  };

  let newQty = currentQty;
  if (adjustmentType === "in") {
    newQty = currentQty + numQty;
  } else if (adjustmentType === "out") {
    newQty = Math.max(0, currentQty - numQty);
  } else if (adjustmentType === "adjustment") {
    newQty = numQty;
  }

  const difference = newQty - currentQty;
  const isInvalidOutQty = adjustmentType === "out" && numQty > currentQty;
  const isStep1Valid =
    Boolean(selectedProductId) &&
    numQty > 0 &&
    !(adjustmentType === "out" && isOutOfStock) &&
    !isInvalidOutQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (isStep1Valid) {
        setStep(2);
      }
      return;
    }

    if (!isStep1Valid) return;

    onConfirm({
      product_id: selectedProductId,
      type: adjustmentType,
      quantity: numQty,
      note: note.trim(),
    });
    onClose();
  };

  const presetReasons = [
    { label: "Supplier Delivery", type: "in" as const },
    { label: "Direct Purchase", type: "in" as const },
    { label: "Sample & Bonus", type: "in" as const },
    { label: "Branch Transfer In", type: "in" as const },
    { label: "Kitchen Return", type: "in" as const },
    { label: "Shift Usage", type: "out" as const },
    { label: "Grinder Calibration", type: "out" as const },
    { label: "Waste & Spoilage", type: "out" as const },
    { label: "Expired & Damage", type: "out" as const },
    { label: "Staff Meal / Tasting", type: "out" as const },
    { label: "Closing Opname", type: "adjustment" as const },
    { label: "Shift Handover", type: "adjustment" as const },
    { label: "Audit Recount", type: "adjustment" as const },
    { label: "Storage Relocation", type: "adjustment" as const },
    { label: "Correction Count", type: "adjustment" as const },
  ];

  return (
    <>
        <DialogHeader className="space-y-1 pb-1 pr-6 text-left min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {step === 1 ? (
                <SlidersHorizontal className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold text-foreground truncate">
                Stock Adjustment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate block">
                {step === 1
                  ? "Adjust raw material quantity, restock, or physical count"
                  : "Specify shift reasons and operational notes"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-1">
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/70 text-xs select-none">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={cn(
                "flex items-center gap-2 font-bold transition-all cursor-pointer",
                step === 1
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all",
                  step === 1
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-primary/20 text-primary",
                )}
              >
                1
              </span>
              <span>Quantity & Calc</span>
            </button>

            <div className="flex-1 mx-3 h-0.5 bg-border/80 rounded-full" />

            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => {
                if (isStep1Valid) setStep(2);
              }}
              className={cn(
                "flex items-center gap-2 font-bold transition-all",
                step === 2
                  ? "text-primary"
                  : isStep1Valid
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all",
                  step === 2
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted text-muted-foreground",
                )}
              >
                2
              </span>
              <span>Reason & Note</span>
            </button>
          </div>

          {step === 1 ? (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-bold text-foreground">
                    Raw Material
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Current Stock:{" "}
                    <strong className="text-foreground font-bold font-mono">
                      {currentQty.toLocaleString("id-ID")}{" "}
                      {currentStock?.unit || "units"}
                    </strong>
                  </span>
                </div>

                {isItemLocked ? (
                  <div className="p-2.5 rounded-xl border border-border/80 bg-muted/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-foreground text-xs sm:text-sm truncate leading-tight">
                          {currentStock?.product_name}
                        </h4>
                        <span className="text-[10.5px] font-mono text-muted-foreground block truncate">
                          {currentStock?.sku} · {currentStock?.category_name}
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
                      <div className="w-full h-10 px-3 rounded-xl border border-input bg-card text-foreground text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer hover:border-primary/60 transition-colors select-none">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Package className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-bold text-foreground truncate">
                            {currentStock?.product_name ||
                              "Select Raw Material"}
                          </span>
                          {currentStock?.sku && (
                            <span className="text-[11px] font-mono text-muted-foreground shrink-0 hidden sm:inline">
                              ({currentStock.sku})
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-full min-w-full max-w-full max-h-48 overflow-y-auto no-scrollbar p-1 rounded-xl bg-card border border-border/80 shadow-lg z-50 divide-y divide-border/30"
                    >
                      {stocks.map((item) => {
                        const isSelected =
                          item.product_id === selectedProductId;
                        return (
                          <DropdownMenuItem
                            key={item.product_id}
                            onClick={() => {
                              setSelectedProductId(item.product_id);
                              if (
                                item.quantity === 0 &&
                                adjustmentType === "out"
                              ) {
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
                              <span className="text-[10px] font-mono text-muted-foreground truncate">
                                {item.sku} · {item.category_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground font-mono font-medium">
                                {item.quantity.toLocaleString("id-ID")}{" "}
                                {item.unit}
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
                  <button
                    type="button"
                    onClick={() => handleSelectAdjustmentType("in")}
                    className={cn(
                      "flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer gap-1.5 select-none",
                      adjustmentType === "in"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10",
                    )}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Restock</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleSelectAdjustmentType("out")}
                    className={cn(
                      "flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold transition-all gap-1.5 select-none",
                      isOutOfStock
                        ? "opacity-35 cursor-not-allowed text-muted-foreground"
                        : adjustmentType === "out"
                          ? "bg-rose-600 text-white shadow-xs cursor-pointer"
                          : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer",
                    )}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    <span>Reduce</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAdjustmentType("adjustment")}
                    className={cn(
                      "flex items-center justify-center py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer gap-1.5 select-none",
                      adjustmentType === "adjustment"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                    )}
                  >
                    <ArrowDownUp className="w-3.5 h-3.5 shrink-0" />
                    <span>Opname</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <Label
                    htmlFor="stock-qty"
                    className="font-bold text-foreground"
                  >
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
                      className="h-10 rounded-xl bg-card border-input text-foreground text-sm font-bold pl-3 pr-12 focus-visible:ring-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                      {currentStock?.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {[5, 10, 20].map((step) => {
                      const isStepDisabled =
                        adjustmentType === "out" && step > currentQty;
                      return (
                        <Button
                          key={step}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isStepDisabled}
                          onClick={() => setQuantity(String(step))}
                          className={cn(
                            "h-10 px-2.5 rounded-xl text-xs font-bold hover:border-primary/60 cursor-pointer bg-card",
                            isStepDisabled &&
                              "opacity-35 cursor-not-allowed hover:border-border",
                          )}
                        >
                          {adjustmentType === "out" ? `-${step}` : `+${step}`}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border/80 flex items-center justify-between text-xs shadow-2xs">
                <span className="text-muted-foreground font-semibold text-[11px]">
                  Resulting Balance:
                </span>
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className="text-muted-foreground/70 line-through text-[11px]">
                    {currentQty.toLocaleString("id-ID")}
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
                    {newQty.toLocaleString("id-ID")} {currentStock?.unit}
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
                    {difference > 0 ? `+${difference}` : difference}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Target Material
                    </span>
                    <h4 className="font-bold text-foreground text-sm truncate">
                      {currentStock?.product_name}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-xl border shrink-0",
                      adjustmentType === "in"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : adjustmentType === "out"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                          : "bg-primary/10 text-primary border-primary/30",
                    )}
                  >
                    {adjustmentType === "in"
                      ? "Restock"
                      : adjustmentType === "out"
                        ? "Reduce"
                        : "Opname"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 font-semibold text-muted-foreground">
                    <span>Adjustment:</span>
                    <span
                      className={cn(
                        "font-bold font-mono",
                        adjustmentType === "in"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : adjustmentType === "out"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-foreground",
                      )}
                    >
                      {adjustmentType === "in"
                        ? `+${numQty.toLocaleString("id-ID")}`
                        : adjustmentType === "out"
                          ? `-${numQty.toLocaleString("id-ID")}`
                          : `Set to ${numQty.toLocaleString("id-ID")}`}{" "}
                      {currentStock?.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-1.5 font-mono">
                    <span className="text-muted-foreground text-[11px]">
                      Final Balance:
                    </span>
                    <span className="font-extrabold text-foreground text-xs sm:text-sm">
                      {newQty.toLocaleString("id-ID")} {currentStock?.unit}
                    </span>
                  </div>
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
                  className="h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-medium focus-visible:ring-primary"
                  autoFocus
                />

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Quick Suggestions (
                    {adjustmentType === "in"
                      ? "Restock"
                      : adjustmentType === "out"
                        ? "Reduce / Usage"
                        : "Opname"}
                    ):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {presetReasons
                      .filter((p) => p.type === adjustmentType)
                      .map((preset, idx) => {
                        const isActive = note === preset.label;
                        const isDesktopOnly = idx >= 3;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setNote(isActive ? "" : preset.label)
                            }
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none active:scale-95",
                              isDesktopOnly && "hidden sm:inline-block",
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
            </div>
          )}

          <DialogFooter className="pt-2 sm:pt-3">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-9.5 rounded-xl text-xs font-semibold px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isStep1Valid) {
                      setStep(2);
                    }
                  }}
                  className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Reason & Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStep(1);
                  }}
                  className="h-9.5 rounded-xl text-xs font-semibold px-4 gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
                <Button
                  type="submit"
                  className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm</span>
                </Button>
              </>
            )}
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
      <DialogContent className="max-w-md p-4 sm:p-5 overflow-hidden">
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
