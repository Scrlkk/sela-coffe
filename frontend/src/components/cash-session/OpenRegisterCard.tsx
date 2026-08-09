import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OpenRegisterCardProps {
  onOpenRegister: (floatAmount: number) => void;
  defaultFloat?: number;
}

export const OpenRegisterCard: React.FC<OpenRegisterCardProps> = ({
  onOpenRegister,
  defaultFloat = 200000,
}) => {
  const [floatInput, setFloatInput] = useState<string>(defaultFloat.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(floatInput);
    if (!isNaN(val) && val >= 0) {
      onOpenRegister(val);
    }
  };

  const handleBlur = () => {
    const val = Number(floatInput);
    if (!isNaN(val) && val >= 0) {
      setFloatInput(val.toString());
    }
  };

  return (
    <Card className="border border-border/60 shadow-xs rounded-2xl bg-card text-card-foreground w-full h-full flex flex-col justify-between transition-all duration-200">
      <CardContent className="p-5 sm:p-7 flex flex-col items-center text-center justify-center flex-1 my-auto">
        {/* Badge Icon */}
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3.5 shadow-2xs">
          <DollarSign className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Heading & Subtitle */}
        <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">
          Open Register
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-sm">
          Enter your opening cash float to begin the day's session.
        </p>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          <div className="space-y-1.5">
            <Label
              htmlFor="opening-cash"
              className="text-xs font-semibold text-foreground"
            >
              Opening cash amount
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground font-semibold text-xs select-none">
                Rp
              </span>
              <Input
                id="opening-cash"
                type="number"
                min="0"
                value={floatInput}
                onBlur={handleBlur}
                onChange={(e) => setFloatInput(e.target.value)}
                placeholder="200000"
                className="h-10 pl-10 rounded-xl bg-muted/40 border-input text-foreground text-sm focus-visible:ring-ring pr-3.5 font-medium shadow-inner w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            Open Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
