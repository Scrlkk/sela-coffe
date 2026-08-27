import React, { useState } from "react";
import type { ProductItem } from "@/services/product";
import { getStoredCategories } from "@/services/category";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackagePlus, Pencil, Info, Lock, Folder } from "lucide-react";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<ProductItem, "id"> | ProductItem) => void;
  initialData?: ProductItem | null;
}

interface ProductFormProps {
  initialData?: ProductItem | null;
  onClose: () => void;
  onSave: (productData: Omit<ProductItem, "id"> | ProductItem) => void;
}

const ProductDialogForm: React.FC<ProductFormProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "espresso");
  const [price, setPrice] = useState<number | "">(initialData?.price ?? "");
  const [stock, setStock] = useState<number | "">(initialData?.stock ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(price) <= 0) return;

    if (initialData) {
      onSave({
        ...initialData,
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(initialData.stock),
        image: "",
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock) || 0,
        image: "",
      });
    }
    onClose();
  };

  const categories = getStoredCategories(false, "product").map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const isEditMode = Boolean(initialData);

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {isEditMode ? (
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <PackagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {isEditMode
              ? "Update menu product details in the POS catalog."
              : "Fill in the details to register a new product to POS."}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="space-y-1">
          <Label
            htmlFor="prod-name"
            className="text-xs font-bold text-foreground"
          >
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="prod-name"
            placeholder="e.g. Iced Vanilla Latte"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9.5 sm:h-10 rounded-xl border-input bg-card text-foreground text-xs sm:text-sm font-semibold"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">
            Category <span className="text-destructive">*</span>
          </Label>
          <FormDropdownPicker
            options={categories}
            value={category}
            onChange={setCategory}
            placeholder="Select Category"
            icon={Folder}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                min="1000"
                step="500"
                placeholder="25000"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
                className="pl-9 h-9.5 sm:h-10 rounded-xl border-input bg-card text-foreground text-xs sm:text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="prod-stock"
                className="text-xs font-bold text-foreground flex items-center gap-1.5"
              >
                <span>Stock</span>
                {isEditMode && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground font-normal">
                    <Lock className="w-2.5 h-2.5" /> Tracked
                  </span>
                )}
              </Label>
            </div>
            <Input
              id="prod-stock"
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value ? Number(e.target.value) : 0)
              }
              disabled={isEditMode}
              className={cn(
                "h-9.5 sm:h-10 rounded-xl border-input bg-card text-foreground text-xs sm:text-sm font-semibold",
                isEditMode &&
                  "bg-muted/50 cursor-not-allowed text-muted-foreground opacity-80",
              )}
            />
          </div>
        </div>

        {isEditMode && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Physical inventory stock levels are managed via raw ingredient
              deductions.
            </p>
          </div>
        )}

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
            className="h-9.5 sm:h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm cursor-pointer"
          >
            {isEditMode ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <ProductDialogForm
            key={initialData ? initialData.id : "new"}
            initialData={initialData}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
