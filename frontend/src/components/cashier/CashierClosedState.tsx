import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  ArrowRight,
  Clock,
  User as UserIcon,
  BadgeAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface CashierClosedStateProps {
  onOpenRegister: (floatAmount: number) => void;
}

const FLOAT_PRESETS = [100000, 200000, 300000, 500000];

export const CashierClosedState: React.FC<CashierClosedStateProps> = ({
  onOpenRegister,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-5">
      <Card className="w-full max-w-md md:max-w-lg bg-card/95 border-border/80 shadow-xl dark:shadow-2xl rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 md:p-7 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-2.5">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl sm:rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner ring-4 sm:ring-6 ring-primary/5">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-card shadow-xs">
              <BadgeAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight">
              Cash Register is Closed
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground max-w-xs sm:max-w-sm leading-snug sm:leading-normal">
              Cashier register shift is currently inactive. Enter your opening
              cash float to open the register and start taking orders.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-secondary/30 border border-border/50 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0">
              <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-muted-foreground text-[10px] sm:text-[11px]">
                Operator:{" "}
              </span>
              <span className="font-bold text-foreground">
                {user?.name || "User"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] sm:text-[11px] font-mono shrink-0">
            <Clock className="w-3 h-3 text-primary" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-3.5 pt-0.5"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="page-gate-float"
              className="text-[11px] sm:text-xs font-bold text-foreground block"
            >
              Opening Cash Float <span className="text-destructive">*</span>
            </Label>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground font-bold text-xs sm:text-sm select-none">
                Rp
              </span>
              <Input
                id="page-gate-float"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={floatInput}
                onChange={(e) => {
                  const cleanVal = e.target.value.replace(/\D/g, "");
                  setFloatInput(cleanVal);
                }}
                placeholder="0"
                className="h-10 sm:h-11 pl-10 sm:pl-10.5 rounded-xl sm:rounded-2xl bg-background/70 border-input text-foreground text-sm sm:text-base md:text-lg font-mono font-black focus-visible:ring-primary shadow-2xs w-full"
                required
              />
            </div>

            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-0.5">
              {FLOAT_PRESETS.map((preset) => {
                const isSelected = Number(floatInput) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all border cursor-pointer select-none text-center truncate",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/60",
                    )}
                  >
                    {formatRupiah(preset, true)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-1.5 sm:pt-2">
            <Button
              type="submit"
              disabled={!hasValidInput}
              className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Open Register & Start Selling</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/cash-sessions")}
              className="w-full h-9 sm:h-9.5 rounded-xl border-border/80 text-foreground hover:bg-muted text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Cash Sessions History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CashierClosedState;
