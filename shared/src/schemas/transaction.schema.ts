import { z } from "zod";

const transactionItemSchema = z.object({
  product_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  unit_price: z.number().min(0, "Harga satuan minimal 0"),
  note: z.string().optional(),
});

export const createTransactionSchema = z.object({
  user_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  cash_session_id: z.string().or(z.number()).transform((val) => BigInt(val)).optional(),
  invoice_number: z.string().min(2, "Nomor invoice minimal 2 karakter").max(50),
  paid_amount: z.number().min(0, "Jumlah bayar minimal 0"),
  payment_method: z.enum(["cash", "qris"], {
    message: "Metode pembayaran harus 'cash' atau 'qris'",
  }).default("cash"),
  note: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, "Minimal terdapat 1 produk dalam transaksi"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
