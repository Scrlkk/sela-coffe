import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Validation Error",
        errors: err.errors,
      });
    } else {
      next(err);
    }
  }
};
