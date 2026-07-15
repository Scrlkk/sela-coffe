import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

export const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: "error",
    statusCode: statusCode,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: ErrorWithStatus = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
