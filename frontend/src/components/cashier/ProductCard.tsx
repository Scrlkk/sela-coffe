import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductItem } from "@/services/product";
import { formatRupiah } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: ProductItem;
  quantity?: number;
  onAddToCart: (product: ProductItem) => void;
  categoryLabel?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity = 0,
  onAddToCart,
  categoryLabel,
}) => {
  const displayCategory =
    categoryLabel ||
    (product.category ? product.category.replace(/-/g, " ") : "");

  return (
    <Card
      onClick={() => onAddToCart(product)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md active:scale-[0.98] cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-2.5">
        <div className="space-y-0.5 pr-7">
          <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          <span className="text-xs text-muted-foreground block truncate capitalize">
            {displayCategory}
          </span>
        </div>

        {quantity > 0 && (
          <span className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs shrink-0 animate-in zoom-in-75 duration-150">
            {quantity}
          </span>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
          <span className="text-[11px] text-muted-foreground font-medium">Price</span>
          <span className="font-extrabold text-sm sm:text-base text-foreground font-mono">
            {formatRupiah(product.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
