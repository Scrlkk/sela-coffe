import type { CartItem } from "@/constants/cashier";

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface PaymentChangeResult {
  numericCash: number;
  isCashValid: boolean;
  changeAmount: number;
  insufficientAmount: number;
}

export function calculateCartTotals(
  cart: CartItem[],
  taxRate: number = 0.1,
): CartTotals {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, tax, total, itemCount };
}

export function calculatePaymentChange({
  total,
  cashReceived,
  paymentMethod,
}: {
  total: number;
  cashReceived: string | number | null | undefined;
  paymentMethod: string;
}): PaymentChangeResult {
  const rawCash = cashReceived ?? total;
  const numericCash = Number(rawCash);
  const isCash = paymentMethod === "Cash";

  if (!isCash) {
    return {
      numericCash: total,
      isCashValid: true,
      changeAmount: 0,
      insufficientAmount: 0,
    };
  }

  const isInvalidNumber = isNaN(numericCash);
  const isCashValid = !isInvalidNumber && numericCash >= total;
  const changeAmount = isCashValid ? Math.max(0, numericCash - total) : 0;
  const insufficientAmount =
    !isInvalidNumber && numericCash < total ? total - numericCash : 0;

  return {
    numericCash,
    isCashValid,
    changeAmount,
    insufficientAmount,
  };
}

export function getCashPresets(
  total: number,
  basePresets: number[] = [50000, 100000, 150000, 200000],
): number[] {
  return basePresets.filter((preset) => preset >= total);
}
