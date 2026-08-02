import { Request, Response, NextFunction } from "express";
import { ZodSchema, z } from "zod";

export const numericIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID harus berupa angka numeric (BigInt)"),
  }),
});

export const customParamIdSchema = (paramName: string) =>
  z.object({
    params: z.object({
      [paramName]: z
        .string()
        .regex(
          /^\d+$/,
          `Param ${paramName} harus berupa angka numeric (BigInt)`,
        ),
    }),
  });

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const shape = (schema as any).shape;
      const isWrapped =
        shape?.body !== undefined ||
        shape?.params !== undefined ||
        shape?.query !== undefined;

      if (isWrapped) {
        const parsed = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        }) as { body?: any; query?: any; params?: any };

        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;
      } else {
        req.body = schema.parse(req.body);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
