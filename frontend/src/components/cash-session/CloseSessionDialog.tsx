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
import { Textarea } from "@/components/ui/textarea";
import { Lock, AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

export interface CloseSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  expectedCash: number;
  openingFloat: number;
  cashSales: number;
  onConfirmClose: (actualCash: number, note?: string) => void;
}

const CloseSessionForm: React.FC<{
  expectedCash: number;
  openingFloat: number;
  cashSales: number;
  onClose: () => void;
  onConfirmClose: (actualCash: number, note?: string) => void;
}> = ({ expectedCash, openingFloat, cashSales, onClose, onConfirmClose }) => {
  const [actualCashInput, setActualCashInput] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const hasInput = actualCashInput.trim() !== "";
  const actualCash = hasInput ? Number(actualCashInput) : 0;
  const variance = actualCash - expectedCash;
  const isMatched = hasInput && variance === 0;
  const isOver = hasInput && variance > 0;
  const isShort = hasInput && variance < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInput) return;
    onConfirmClose(actualCash, note.trim());
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Close Cash Register
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Count and enter the actual physical cash inside the drawer.
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Opening Float:</span>
            <span className="font-semibold text-foreground font-mono">
              {formatRupiah(openingFloat)}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Cash Sales:</span>
            <span className="font-semibold text-foreground font-mono">
              +{formatRupiah(cashSales)}
            </span>
          </div>
          <div className="pt-1.5 border-t border-border/40 flex justify-between items-center font-bold text-xs sm:text-sm">
            <span className="text-foreground">Expected in Drawer:</span>
            <span className="text-foreground font-mono text-sm sm:text-base font-extrabold">
              {formatRupiah(expectedCash)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="actual-cash"
              className="text-xs font-bold text-foreground"
            >
              Actual Physical Cash Counted{" "}
              <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground font-medium">
              Drawer count
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-muted-foreground font-semibold text-xs select-none">
              Rp
            </span>
            <Input
              id="actual-cash"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={actualCashInput}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const cleanVal = e.target.value.replace(/\D/g, "");
                setActualCashInput(cleanVal);
              }}
              placeholder="0"
              className="h-9.5 sm:h-10 pl-10 rounded-xl bg-card border-input text-foreground text-sm font-mono font-bold focus-visible:ring-primary shadow-2xs w-full"
              required
              autoFocus
            />
          </div>
        </div>

        {hasInput ? (
          <div
            className={cn(
              "p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all animate-in fade-in-50 duration-200",
              isMatched &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              isOver &&
                "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
              isShort &&
                "bg-destructive/10 text-destructive border-destructive/30",
            )}
          >
            <div className="flex items-center gap-1.5">
              {isMatched ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {isMatched
                  ? "Balanced / Match"
                  : isOver
                    ? "Cash Surplus"
                    : "Cash Shortage"}
              </span>
            </div>
            <span className="font-mono text-xs sm:text-sm font-extrabold">
              {isMatched
                ? "Match (Rp 0)"
                : isOver
                  ? `+${formatRupiah(variance)}`
                  : `-${formatRupiah(Math.abs(variance))}`}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-muted/30 border border-dashed border-border/70 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>Enter physical drawer count above</span>
            </div>
            <span className="font-mono text-[11px]">—</span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="closing-note"
              className="text-xs font-bold text-foreground"
            >
              Closing Notes (Optional)
            </Label>
            <span className="text-[10px] text-muted-foreground font-mono">
              {note.length}/200
            </span>
          </div>
          <Textarea
            id="closing-note"
            maxLength={200}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Shift ended normally, cash verified..."
            className="min-h-16 rounded-xl bg-card border-input text-foreground text-xs font-medium resize-none"
          />
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
            disabled={!hasInput}
            className="h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close Register
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const CloseSessionDialog: React.FC<CloseSessionDialogProps> = ({
  isOpen,
  onClose,
  expectedCash,
  openingFloat,
  cashSales,
  onConfirmClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isOpen && (
          <CloseSessionForm
            key={String(isOpen)}
            expectedCash={expectedCash}
            openingFloat={openingFloat}
            cashSales={cashSales}
            onClose={onClose}
            onConfirmClose={onConfirmClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CloseSessionDialog;
