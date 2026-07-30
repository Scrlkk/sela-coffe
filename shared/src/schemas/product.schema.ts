import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(200, "Nama produk maksimal 200 karakter"),
  sku: z.string().min(2, "SKU minimal 2 karakter").max(50, "SKU maksimal 50 karakter"),
  description: z.string().max(1000).optional(),
  cost_price: z.number().min(0, "Harga pokok minimal 0").default(0),
  price: z.number().min(0, "Harga jual minimal 0").default(0),
  image: z.string().max(255).optional(),
  weight: z.number().min(0).optional(),
  unit: z.string().max(20).default("pcs"),
  is_active: z.boolean().optional().default(true),
  
  initial_stock: z.number().int().min(0).optional().default(0),
  min_stock: z.number().int().min(0).optional().default(5),
  max_stock: z.number().int().min(0).optional().default(100),
});

export const updateProductSchema = z.object({
  category_id: z.string().or(z.number()).transform((val) => BigInt(val)).optional(),
  name: z.string().min(2).max(200).optional(),
  sku: z.string().min(2).max(50).optional(),
  description: z.string().max(1000).optional(),
  cost_price: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  image: z.string().max(255).optional(),
  weight: z.number().min(0).optional(),
  unit: z.string().max(20).optional(),
  is_active: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
