import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, type ProductItem } from "@/constants/cashier";
import { formatRupiah } from "@/utils/formatCurrency";

interface ProductCardProps {
  product: ProductItem;
  quantity?: number;
  onAddToCart: (product: ProductItem) => void;
}

export function ProductCard({
  product,
  quantity = 0,
  onAddToCart,
}: ProductCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.id === product.category)?.label ||
    product.category;

  return (
    <Card
      onClick={() => onAddToCart(product)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md active:scale-[0.98] cursor-pointer overflow-hidden flex flex-col justify-between select-none"
    >
      <CardContent className="p-3 sm:p-3.5 flex flex-col justify-between h-full space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>

          {quantity > 0 && (
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center shadow-xs shrink-0 animate-in zoom-in-75 duration-150">
              {quantity}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-border/40 mt-auto text-xs gap-1">
          <span className="text-muted-foreground font-medium text-[11px] truncate capitalize">
            {categoryLabel}
          </span>
          <span className="font-extrabold text-xs sm:text-sm text-foreground shrink-0">
            {formatRupiah(product.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
