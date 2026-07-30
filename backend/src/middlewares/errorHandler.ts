import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return ApiResponse.error({
      res,
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validasi data gagal",
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return ApiResponse.error({
      res,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
    });
  }

  console.error("Unhandled Error:", err);
  return ApiResponse.error({
    res,
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new AppError(
      `Resource tidak ditemukan - ${req.originalUrl}`,
      404,
      "NOT_FOUND",
    ),
  );
};
