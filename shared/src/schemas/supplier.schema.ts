import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(2, "Nama supplier minimal 2 karakter").max(100, "Nama supplier maksimal 100 karakter"),
  phone: z.string().max(20).optional(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  contact_person: z.string().max(100).optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  contact_person: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
