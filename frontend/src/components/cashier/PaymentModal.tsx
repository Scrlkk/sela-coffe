import { useState, type MouseEvent } from "react";
import {
  CheckCircle2,
  PlusCircle,
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CartItem } from "@/constants/cashier";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  onClose: () => void;
  onNewOrder: () => void;
}

export function PaymentModal({
  isOpen,
  orderNumber,
  items,
  subtotal,
  tax,
  total,
  onClose,
  onNewOrder,
}: PaymentModalProps) {
  const [step, setStep] = useState<"select-method" | "processing" | "success">(
    "select-method",
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [cashInput, setCashInput] = useState<string | null>(null);

  if (!isOpen) return null;

  const cashReceived = cashInput ?? total.toString();
  const numericCash = Number(cashReceived);
  const isCashValid =
    paymentMethod !== "Cash" || (!isNaN(numericCash) && numericCash >= total);
  const changeAmount =
    paymentMethod === "Cash" ? Math.max(0, numericCash - total) : 0;

  const paymentMethods = [
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "QRIS", label: "QRIS", icon: QrCode },
    { id: "Card", label: "Card", icon: CreditCard },
  ];

  const handleConfirmPayment = () => {
    if (!isCashValid) return;
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 900);
  };

  const handleNewOrder = () => {
    setStep("select-method");
    setCashInput(null);
    onNewOrder();
  };

  const handleClose = () => {
    setStep("select-method");
    setCashInput(null);
    onClose();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (step === "success") {
        handleNewOrder();
      } else if (step === "select-method") {
        handleClose();
      }
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <Card className="border-border/60 shadow-xl rounded-3xl bg-card text-card-foreground max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <CardContent className="p-6 text-center space-y-4 sm:space-y-5">
          {step === "select-method" && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
                <Wallet className="w-7 h-7 stroke-2" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Select Payment Method
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Order #{orderNumber}
                </p>
              </div>

              <div className="bg-muted/40 rounded-2xl p-3.5 border border-border/60 text-center space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Total Amount Due
                </p>
                <p className="text-2xl font-black text-primary">
                  {formatRupiah(total)}
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={cn(
                          "py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer border select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground border-transparent shadow-xs"
                            : "bg-muted/30 text-foreground/80 border-border/60 hover:bg-muted",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === "Cash" && (
                <div className="space-y-2 text-left bg-muted/30 p-3.5 rounded-2xl border border-border/60 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="cash-received"
                      className="text-xs font-bold text-foreground"
                    >
                      Cash Received
                    </Label>
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-muted-foreground font-semibold text-xs select-none">
                      Rp
                    </span>
                    <Input
                      id="cash-received"
                      type="number"
                      min={total}
                      value={cashReceived}
                      onChange={(e) => setCashInput(e.target.value)}
                      placeholder={total.toString()}
                      className="h-10 pl-9 rounded-xl bg-card border-input text-foreground text-sm font-bold focus-visible:ring-primary w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                    <button
                      type="button"
                      onClick={() => setCashInput(total.toString())}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-card border border-border/60 hover:bg-muted text-foreground cursor-pointer shrink-0"
                    >
                      Exact Amount
                    </button>
                    {[50000, 100000, 150000, 200000].map(
                      (preset) =>
                        preset >= total && (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCashInput(preset.toString())}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-card border border-border/60 hover:bg-muted text-foreground cursor-pointer shrink-0"
                          >
                            {formatRupiah(preset)}
                          </button>
                        ),
                    )}
                  </div>

                  {!isNaN(numericCash) && numericCash < total && (
                    <p className="text-[11px] text-destructive font-semibold">
                      Insufficient cash by {formatRupiah(total - numericCash)}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-11 rounded-full border-border text-foreground hover:bg-muted text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  disabled={!isCashValid}
                  onClick={handleConfirmPayment}
                  className="h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Payment
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="py-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">
                  Processing Payment...
                </h3>
                <p className="text-xs text-muted-foreground">
                  Processing {paymentMethod} transaction for #{orderNumber}
                </p>
              </div>
              <div className="bg-muted/40 rounded-2xl p-4 border border-border/60 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Total Amount
                </p>
                <p className="text-xl font-extrabold text-foreground">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-5 animate-in fade-in zoom-in-90 duration-300">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75 duration-1000" />
                <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md border border-emerald-500/30 animate-in zoom-in-50 duration-500">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5] animate-in spin-in-12 zoom-in-75 duration-500" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Payment Successful!
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Order #{orderNumber} · Method: {paymentMethod}
                </p>
              </div>

              <div className="bg-muted/40 rounded-2xl p-4 text-left text-xs space-y-2 border border-border/60 max-h-60 overflow-y-auto no-scrollbar">
                <p className="font-bold text-foreground border-b border-border/60 pb-1.5 mb-2">
                  Order Details
                </p>
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-foreground">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/60 space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PB1 Tax (10%)</span>
                    <span>{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-foreground pt-1 border-t border-border/60">
                    <span>Total Paid</span>
                    <span className="text-primary font-bold">
                      {formatRupiah(total)}
                    </span>
                  </div>

                  {paymentMethod === "Cash" && (
                    <div className="pt-2 border-t border-border/40 space-y-1">
                      <div className="flex justify-between font-medium text-foreground">
                        <span>Cash Received</span>
                        <span>{formatRupiah(numericCash)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold text-sm pt-0.5">
                        <span>Change Due</span>
                        <span>{formatRupiah(changeAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleNewOrder}
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Order</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

