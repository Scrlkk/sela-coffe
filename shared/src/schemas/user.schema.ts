import { z } from "zod";

export const userRoleEnum = z.enum(["ADMIN", "CASHIER"]);

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh huruf, angka, dan underscore",
    ),
  password: z.string().min(6).max(100),
  role: userRoleEnum.optional().default("CASHIER"),
  phone: z.string().max(20).optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ username: true });

export type UserRole = z.infer<typeof userRoleEnum>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

