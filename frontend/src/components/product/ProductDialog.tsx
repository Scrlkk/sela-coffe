import React, { useState } from "react";
import type { ProductItem } from "@/constants/cashier";
import { CATEGORIES } from "@/constants/cashier";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { X, PackagePlus, Pencil, ChevronDown, Check } from "lucide-react";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<ProductItem, "id"> | ProductItem) => void;
  initialData?: ProductItem | null;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "espresso");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [stock, setStock] = useState<number | "">(initialData?.stock ?? 10);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    setName(initialData?.name ?? "");
    setCategory(initialData?.category ?? "espresso");
    setPrice(initialData?.price ?? "");
    setStock(initialData?.stock ?? 10);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) return;

    if (initialData) {
      onSave({
        ...initialData,
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        image: "",
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        image: "",
      });
    }
    onClose();
  };

  const categories = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
    >
      <Card className="border-border/60 shadow-xl rounded-2xl sm:rounded-3xl bg-card text-card-foreground max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {initialData ? (
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <PackagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {initialData ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Fill in the details for Sela Coffee product
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <Label
                htmlFor="prod-name"
                className="text-xs font-bold text-foreground"
              >
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prod-name"
                placeholder="e.g. Spanish Latte Special"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="prod-category"
                  className="text-xs font-bold text-foreground"
                >
                  Category
                </Label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full h-8.5 sm:h-10 px-3 rounded-xl border border-input bg-card text-foreground text-xs sm:text-sm font-semibold shadow-2xs hover:bg-muted/40 transition-colors cursor-pointer select-none"
                    >
                      <span className="truncate">
                        {categories.find((c) => c.id === category)?.label ??
                          category}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-48 sm:w-56 rounded-xl p-1 bg-card border border-border/80 shadow-md"
                  >
                    {categories.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className="flex items-center justify-between py-2 px-2.5 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        <span>{c.label}</span>
                        {category === c.id && (
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="prod-stock"
                  className="text-xs font-bold text-foreground"
                >
                  Stock Quantity
                </Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  required
                  className="h-8.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="prod-price"
                className="text-xs font-bold text-foreground"
              >
                Price (Rp) <span className="text-destructive">*</span>
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground font-semibold text-xs select-none">
                  Rp
                </span>
                <Input
                  id="prod-price"
                  type="number"
                  min="0"
                  placeholder="25000"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  required
                  className="h-8.5 sm:h-10 pl-9 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-bold focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 sm:pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 sm:h-11 rounded-full border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 sm:h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                {initialData ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
