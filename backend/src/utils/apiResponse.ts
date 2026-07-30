import { Response } from "express";
import { PaginationMeta } from "./pagination";

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

/**
 * Utility pembentuk respon JSON API terstandar (success & error)
 * ponytail: clean API response builder
 */
export class ApiResponse {
  static success<T>({
    res,
    statusCode = 200,
    message,
    data,
    meta,
  }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      ...(message ? { message } : {}),
      ...(data !== undefined ? { data } : {}),
      ...(meta ? { meta } : {}),
    });
  }

  static error({
    res,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    message,
    errors,
  }: {
    res: Response;
    statusCode?: number;
    code?: string;
    message: string;
    errors?: any;
  }) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(errors ? { details: errors } : {}),
      },
    });
  }
}
