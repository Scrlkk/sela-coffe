import React, { useState } from "react";
import type { IngredientItem } from "@/services/ingredient";
import { getStoredCategories } from "@/services/category";
import { getStoredSuppliers } from "@/services/supplier";
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
import { Textarea } from "@/components/ui/textarea";
import { Wheat, Pencil, Folder, Scale, Truck } from "lucide-react";

interface IngredientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: IngredientItem | null;
  onSave: (
    data: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
  ) => void;
}

const COMMON_UNITS = [
  { id: "gram", label: "Gram (g)" },
  { id: "ml", label: "Milliliter (ml)" },
  { id: "pcs", label: "Pieces (pcs)" },
  { id: "kg", label: "Kilogram (kg)" },
  { id: "liter", label: "Liter (L)" },
  { id: "box", label: "Box" },
  { id: "can", label: "Can / Kaleng" },
  { id: "shot", label: "Shot" },
];

interface IngredientFormProps {
  ingredient: IngredientItem | null;
  onClose: () => void;
  onSave: (
    data: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
  ) => void;
}

const IngredientDialogForm: React.FC<IngredientFormProps> = ({
  ingredient,
  onClose,
  onSave,
}) => {
  const categories = getStoredCategories(false, "ingredient").map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const suppliers = [
    { id: "", label: "None / Direct Procurement" },
    ...getStoredSuppliers(false).map((s) => ({
      id: s.id,
      label: s.name,
    })),
  ];

  const [name, setName] = useState(ingredient?.name ?? "");
  const [category, setCategory] = useState(
    ingredient?.category ?? (categories[0]?.id || "coffee-beans"),
  );
  const [unit, setUnit] = useState(ingredient?.unit ?? "gram");
  const [costPrice, setCostPrice] = useState<number | "">(
    ingredient?.costPrice ?? "",
  );
  const [supplierId, setSupplierId] = useState(ingredient?.supplierId ?? "");
  const [notes, setNotes] = useState(ingredient?.notes ?? "");

  const isEditMode = Boolean(ingredient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Number(costPrice) < 0) return;

    onSave({
      name: name.trim(),
      sku: ingredient?.sku ?? "",
      category,
      unit,
      costPrice: Number(costPrice) || 0,
      currentStock: ingredient?.currentStock ?? 0,
      minStock: ingredient?.minStock ?? 50,
      maxStock: ingredient?.maxStock ?? 1000,
      supplierId: supplierId || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {isEditMode ? (
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {isEditMode ? "Edit Raw Material" : "Add Raw Material"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Fill in master catalog specifications for coffee shop ingredient
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        
        <div className="space-y-1">
          <Label
            htmlFor="ing-name"
            className="text-xs font-bold text-foreground"
          >
            Material Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ing-name"
            placeholder="e.g. Arabica House Blend 100%"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold"
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
            <Label className="text-xs font-bold text-foreground">
              Unit of Measure <span className="text-destructive">*</span>
            </Label>
            <FormDropdownPicker
              options={COMMON_UNITS}
              value={unit}
              onChange={setUnit}
              placeholder="Select Unit"
              icon={Scale}
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="ing-cost"
              className="text-xs font-bold text-foreground"
            >
              Cost / Unit (Rp) <span className="text-destructive">*</span>
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground font-semibold text-xs select-none">
                Rp
              </span>
              <Input
                id="ing-cost"
                type="number"
                min="0"
                placeholder="250"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                required
                className="h-9.5 sm:h-10 pl-9 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">
            Partner Supplier (Optional)
          </Label>
          <FormDropdownPicker
            options={suppliers}
            value={supplierId}
            onChange={setSupplierId}
            placeholder="None / Direct Procurement"
            icon={Truck}
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="ing-notes"
            className="text-xs font-bold text-foreground"
          >
            Specifications & Notes (Optional)
          </Label>
          <Textarea
            id="ing-notes"
            placeholder="e.g. Medium dark roast, Aceh Gayo origin, stored in airtight canister"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-medium resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
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
            {isEditMode ? "Save Changes" : "Add Ingredient"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const IngredientDialog: React.FC<IngredientDialogProps> = ({
  isOpen,
  onClose,
  ingredient,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <IngredientDialogForm
            key={ingredient ? ingredient.id : "new"}
            ingredient={ingredient}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IngredientDialog;
