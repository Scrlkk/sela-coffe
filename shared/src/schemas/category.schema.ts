import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .max(100, "Slug maksimal 100 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung",
    )
    .optional(),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional(),
  image: z.string().max(255).optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
