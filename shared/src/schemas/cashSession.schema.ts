import { z } from "zod";

export const openCashSessionSchema = z.object({
  user_id: z.string().or(z.number()).transform((val) => BigInt(val)),
  opening_balance: z.number().min(0, "Saldo awal minimal 0").default(0),
  note: z.string().optional(),
});

export const closeCashSessionSchema = z.object({
  closing_balance: z.number().min(0, "Saldo penutupan minimal 0"),
  note: z.string().optional(),
});

export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>;
export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>;
