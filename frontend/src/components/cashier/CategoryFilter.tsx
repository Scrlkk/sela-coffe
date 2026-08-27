import React, { useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getStoredCategories } from "@/services/category";
import { getStoredProducts, type ProductItem } from "@/services/product";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  products?: ProductItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const categories = useMemo(() => {
    const stored = getStoredCategories(false, "product");
    const activeProducts = (products ?? getStoredProducts(false)).filter(
      (p) => !p.isDeleted && p.is_active !== false,
    );

    const usedCategoryKeys = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.category) {
        usedCategoryKeys.add(p.category.toLowerCase().trim());
      }
    });

    const activeCategories = stored.filter(
      (c) =>
        usedCategoryKeys.has(c.id.toLowerCase().trim()) ||
        usedCategoryKeys.has(c.name.toLowerCase().trim()),
    );

    return [
      { id: "all", label: "All Items" },
      ...activeCategories.map((c) => ({ id: c.id, label: c.name })),
    ];
  }, [products]);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !categories.some((c) => c.id === selectedCategory)
    ) {
      onSelectCategory("all");
    }
  }, [categories, selectedCategory, onSelectCategory]);

  return (
    <div className="flex flex-col gap-2.5 bg-card p-3 sm:p-3.5 rounded-2xl border border-border/80 shadow-xs mb-4">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search menu or product name..."
          className="h-9.5 pl-10 pr-9 rounded-xl bg-background border-border/80 text-foreground text-xs sm:text-sm focus-visible:ring-primary shadow-2xs w-full font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs select-none border",
                isActive
                  ? "bg-primary text-primary-foreground border-transparent shadow-xs"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted border-border/60",
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
