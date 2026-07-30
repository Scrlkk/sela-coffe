import { z } from "zod";

export interface LoginInput {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});
