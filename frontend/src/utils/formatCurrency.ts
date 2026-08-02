export function formatRupiah(amount: number, compact = false): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export default formatRupiah;
