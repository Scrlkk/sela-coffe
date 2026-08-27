import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface CashierSessionGateModalProps {
  isOpen: boolean;
  onOpenRegister: (floatAmount: number) => void;
  onClose?: () => void;
}

const FLOAT_PRESETS = [100000, 200000, 300000, 500000];

const CashierSessionGateForm: React.FC<{
  onOpenRegister: (floatAmount: number) => void;
  onGoToHistory: () => void;
}> = ({ onOpenRegister, onGoToHistory }) => {
  const [floatInput, setFloatInput] = useState<string>("");

  const hasValidInput =
    floatInput.trim() !== "" &&
    !isNaN(Number(floatInput)) &&
    Number(floatInput) >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidInput) return;
    onOpenRegister(Number(floatInput));
  };

  const handleSelectPreset = (amount: number) => {
    setFloatInput(amount.toString());
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            Cash Register is Closed
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Enter your opening float to start taking customer orders.
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <Label
              htmlFor="gate-float"
              className="text-xs font-bold text-foreground"
            >
              Opening Cash Float (Modal Awal) <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground font-medium">
              Cash in drawer
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-muted-foreground font-semibold text-xs select-none">
              Rp
            </span>
            <Input
              id="gate-float"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={floatInput}
              onChange={(e) => {
                const cleanVal = e.target.value.replace(/\D/g, "");
                setFloatInput(cleanVal);
              }}
              placeholder="0"
              className="h-9.5 sm:h-10 pl-10 rounded-xl bg-card border-input text-foreground text-sm font-mono font-bold focus-visible:ring-primary shadow-2xs w-full"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {FLOAT_PRESETS.map((preset) => {
              const isSelected = Number(floatInput) === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/60",
                  )}
                >
                  {formatRupiah(preset, true)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2 sm:pt-3 border-t border-border/60">
          <Button
            type="submit"
            disabled={!hasValidInput}
            className="w-full h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Open Register & Start Selling</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onGoToHistory}
            className="w-full h-9.5 sm:h-10 rounded-xl border-border/80 text-foreground hover:bg-muted text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>View Cash Sessions History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </>
  );
};

export const CashierSessionGateModal: React.FC<
  CashierSessionGateModalProps
> = ({ isOpen, onOpenRegister, onClose }) => {
  const navigate = useNavigate();

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/cash-sessions");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent showCloseButton={true} className="max-w-md">
        {isOpen && (
          <CashierSessionGateForm
            key={String(isOpen)}
            onOpenRegister={onOpenRegister}
            onGoToHistory={() => navigate("/cash-sessions")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CashierSessionGateModal;
