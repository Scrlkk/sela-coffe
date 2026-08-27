export function formatRupiah(amount: number, compact = false): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export function formatNumber(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function formatStockDelta(
  type: "in" | "out" | "adjustment",
  quantity: number,
  setPrefix = "Set",
): string {
  const formatted = formatNumber(quantity);
  if (type === "in") return `+${formatted}`;
  if (type === "out") return `-${formatted}`;
  return `${setPrefix} ${formatted}`;
}

export default formatRupiah;
