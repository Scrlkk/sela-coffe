import React, { useState } from "react";
import type { CategoryItem, CategoryType } from "@/services/category";
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
import { FolderPlus, Pencil, Wheat } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Omit<CategoryItem, "id"> | CategoryItem) => void;
  initialData?: CategoryItem | null;
  categoryType?: CategoryType;
}

interface CategoryFormProps {
  initialData?: CategoryItem | null;
  categoryType: CategoryType;
  onClose: () => void;
  onSave: (categoryData: Omit<CategoryItem, "id"> | CategoryItem) => void;
}

const CategoryDialogForm: React.FC<CategoryFormProps> = ({
  initialData,
  categoryType,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const effectiveType = initialData?.type || categoryType;
  const isIngredient = effectiveType === "ingredient";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSave({
        ...initialData,
        name: name.trim(),
        description: description.trim() || undefined,
        type: effectiveType,
      });
    } else {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        type: effectiveType,
      });
    }
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {initialData ? (
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : isIngredient ? (
            <Wheat className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
            {initialData
              ? `Edit ${isIngredient ? "Ingredient" : "Product"} Category`
              : `Add New ${isIngredient ? "Ingredient" : "Product"} Category`}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {isIngredient
              ? "Organize raw materials, coffee beans, syrups, and packaging"
              : "Organize menu items, drinks, foods, and pastries for cashier"}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-2">
        <div className="space-y-1">
          <Label
            htmlFor="cat-name"
            className="text-xs font-bold text-foreground"
          >
            Category Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            placeholder={
              isIngredient
                ? "e.g. Dairy & Milk, Syrups, Packaging"
                : "e.g. Espresso Based, Pastry & Bakery"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold"
          />
        </div>

        <div className="space-y-1">
          <Label
            htmlFor="cat-desc"
            className="text-xs font-bold text-foreground"
          >
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (Optional)
            </span>
          </Label>
          <Input
            id="cat-desc"
            placeholder="Brief description of this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9.5 sm:h-10 rounded-xl bg-card border-input text-foreground text-xs sm:text-sm font-semibold"
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
            {initialData ? "Save Changes" : "Add Category"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categoryType = "product",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {isOpen && (
          <CategoryDialogForm
            key={initialData ? initialData.id : "new"}
            initialData={initialData}
            categoryType={categoryType}
            onClose={onClose}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
