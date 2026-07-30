import { z } from "zod";

const purchaseItemSchema = z.object({
  product_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  unit_price: z.number().min(0, "Harga satuan minimal 0"),
});

export const createPurchaseSchema = z.object({
  supplier_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  user_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  invoice_number: z.string().min(2, "Nomor invoice minimal 2 karakter").max(255),
  purchase_date: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
  note: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Minimal harus terdapat 1 item pembelian"),
});

export const updatePurchaseStatusSchema = z.object({
  status: z.enum(["draft", "ordered", "received", "cancelled"], {
    message: "Status pembelian harus 'draft', 'ordered', 'received', atau 'cancelled'",
  }),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseStatusInput = z.infer<typeof updatePurchaseStatusSchema>;
