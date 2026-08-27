import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/services/product";
import { formatRupiah } from "@/utils/formatCurrency";
import { calculateCartTotals } from "@/utils/checkout";

interface CartPanelProps {
  cart: CartItem[];
  orderNumber?: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  cart,
  orderNumber,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartPanelProps) {
  const { subtotal, tax, total } = calculateCartTotals(cart);

  return (
    <Card className="border border-border/60 shadow-xs rounded-2xl bg-card text-card-foreground h-full flex flex-col justify-between overflow-hidden py-0">
      <CardContent className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-4 sm:pb-5 flex flex-col h-full space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Current Order
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {orderNumber ? `Order #${orderNumber}` : `${cart.length} item(s)`}
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-destructive hover:underline font-semibold cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 min-h-40 pr-0.5">
          {cart.length === 0 ? (
            <div className="h-full min-h-44 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <ShoppingBag className="w-6 h-6 stroke-1.5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any product to add it to your order
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 transition-all hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatRupiah(item.product.price)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="w-6 h-6 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-border/60 space-y-3 mt-auto">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>PB1 Tax (10%)</span>
              <span className="font-semibold text-foreground">
                {formatRupiah(tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-foreground pt-1.5 border-t border-border/40">
              <span>Total Pay</span>
              <span className="text-base text-primary font-bold">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          <Button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay Now · {formatRupiah(total)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
