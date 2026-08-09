import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShoppingCart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/utils/formatCurrency";

interface ActiveRegisterCardProps {
  startedAt: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  qrSales: number;
  onCloseRegister: () => void;
}

interface BreakdownRow {
  label: string;
  amount: number;
}

export const ActiveRegisterCard: React.FC<ActiveRegisterCardProps> = ({
  startedAt,
  openingFloat,
  cashSales,
  cardSales,
  qrSales,
  onCloseRegister,
}) => {
  const navigate = useNavigate();
  const expectedCash = openingFloat + cashSales;

  const salesBreakdown: BreakdownRow[] = [
    { label: "Cash Sales", amount: cashSales },
    { label: "Card Sales", amount: cardSales },
    { label: "QR Sales", amount: qrSales },
  ];

  return (
    <Card className="border border-border/60 shadow-xs rounded-2xl bg-card text-card-foreground w-full h-full flex flex-col justify-between transition-all duration-200">
      <CardContent className="p-5 sm:p-7 flex flex-col items-center text-center justify-between flex-1 h-full">
        {/* Top Header & Badge */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3.5 shadow-2xs">
            <Check className="w-7 h-7 stroke-3" />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">
            Register is Open
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Session started at {startedAt} · Float: {formatRupiah(openingFloat)}
          </p>
        </div>

        {/* Mapped Sales Breakdown Container */}
        <div className="w-full bg-muted/40 rounded-xl p-4 mb-5 border border-border/60 text-left space-y-2.5 shadow-2xs">
          {salesBreakdown.map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center text-xs sm:text-sm"
            >
              <span className="text-muted-foreground font-medium">
                {row.label}
              </span>
              <span className="font-semibold text-foreground">
                {formatRupiah(row.amount)}
              </span>
            </div>
          ))}

          <div className="pt-2 border-t border-border/60 flex justify-between items-center text-xs sm:text-sm">
            <span className="text-foreground font-bold">Expected Cash</span>
            <span className="font-extrabold text-sm sm:text-base text-foreground">
              {formatRupiah(expectedCash)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <Button
            onClick={() => navigate("/cashier")}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Cashier</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Button>

          <Button
            onClick={onCloseRegister}
            variant="outline"
            className="w-full h-10 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-all cursor-pointer"
          >
            Close Register
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
