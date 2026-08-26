import { useState, useMemo, useDeferredValue } from "react";
import { toast } from "sonner";
import { CategoryFilter } from "@/components/cashier/CategoryFilter";
import { ProductCard } from "@/components/cashier/ProductCard";
import { CartPanel } from "@/components/cashier/CartPanel";
import { PaymentModal } from "@/components/cashier/PaymentModal";
import type { ProductItem, CartItem } from "@/constants/cashier";
import { getStoredProducts } from "@/services/product";

function generateTxnNumber() {
  return `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CashierPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTxnNumber, setActiveTxnNumber] =
    useState<string>(generateTxnNumber);

  const allProducts = useMemo(() => getStoredProducts(false), []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (product.is_active === false) return false;
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, deferredSearch]);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const tx = Math.round(sub * 0.1);
    return { subtotal: sub, tax: tx, total: sub + tx };
  }, [cart]);

  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsModalOpen(true);
  };

  const handleNewOrder = () => {
    setIsModalOpen(false);
    setCart([]);
    setActiveTxnNumber(generateTxnNumber());
    toast.success("Ready for new order");
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-5">
      <div className="flex-1 flex flex-col min-w-0">
        <CategoryFilter
          products={allProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-dashed border-border">
              <p className="text-sm font-bold text-foreground">
                No products found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting another category or clear your search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
              {filteredProducts.map((product) => {
                const cartQty =
                  cart.find((item) => item.product.id === product.id)
                    ?.quantity || 0;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cartQty}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-full xl:w-96 2xl:w-105 shrink-0 xl:h-full pb-6 xl:pb-0">
        <CartPanel
          cart={cart}
          orderNumber={activeTxnNumber}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        orderNumber={activeTxnNumber}
        items={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onClose={() => setIsModalOpen(false)}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
