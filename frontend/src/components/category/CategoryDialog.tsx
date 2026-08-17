import React, { useState } from "react";
import type { CategoryItem } from "@/services/category";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FolderPlus, Pencil } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Omit<CategoryItem, "id"> | CategoryItem) => void;
  initialData?: CategoryItem | null;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    setName(initialData?.name ?? "");
    setDescription(initialData?.description ?? "");
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      onSave({
        ...initialData,
        name: name.trim(),
        description: description.trim(),
      });
    } else {
      onSave({
        name: name.trim(),
        description: description.trim(),
      });
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <Card className="border-border/60 shadow-xl rounded-2xl bg-card text-card-foreground max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {initialData ? (
                  <Pencil className="w-4 h-4" />
                ) : (
                  <FolderPlus className="w-4 h-4" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground leading-tight">
                  {initialData ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fill in details for Sela Coffee product category
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Category Name */}
            <div className="space-y-1">
              <Label htmlFor="cat-name" className="text-xs font-bold text-foreground">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Dessert & Bakery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 rounded-xl bg-card border-border/60 text-foreground text-xs focus-visible:ring-primary"
              />
            </div>

            {/* Category Description */}
            <div className="space-y-1">
              <Label htmlFor="cat-desc" className="text-xs font-bold text-foreground">
                Description
              </Label>
              <Input
                id="cat-desc"
                placeholder="Brief description of this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 rounded-xl bg-card border-border/60 text-foreground text-xs focus-visible:ring-primary"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 rounded-xl border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                {initialData ? "Save Changes" : "Add Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDialog;
