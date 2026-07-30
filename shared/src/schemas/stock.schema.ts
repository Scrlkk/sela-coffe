import { z } from "zod";

export const adjustStockSchema = z.object({
  product_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  user_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  type: z.enum(["in", "out", "adjustment"], {
    message: "Tipe penyesuaian stok harus 'in', 'out', atau 'adjustment'",
  }),
  quantity: z.number().int("Jumlah stok harus angka bulat").refine((val) => val !== 0, {
    message: "Jumlah penyesuaian stok tidak boleh 0",
  }),
  reference_type: z.string().max(50).optional(),
  reference_id: z.string().or(z.number()).transform((val) => BigInt(val)).optional(),
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const updateStockLimitsSchema = z.object({
  min_stock: z.number().int().min(0).optional(),
  max_stock: z.number().int().min(0).optional(),
});

export const stockLogQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  product_id: z.string().optional(),
  user_id: z.string().optional(),
  type: z.enum(["in", "out", "adjustment"]).optional(),
  reference_type: z.string().optional(),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type UpdateStockLimitsInput = z.infer<typeof updateStockLimitsSchema>;
export type StockLogQueryInput = z.infer<typeof stockLogQuerySchema>;
