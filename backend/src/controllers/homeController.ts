import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../db/prisma";
import { ApiResponse } from "../utils/apiResponse";

/**
 * GET /api
 * Root Endpoint: Menyajikan metadata singkat mengenai API server
 */
export const getHome = asyncHandler(async (_req: Request, res: Response) => {
  ApiResponse.success({
    res,
    data: {
      name: "Sela POS API",
      version: "1.0.0",
      status: "online",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      documentation: "/api/docs",
      endpoints: {
        auth: {
          login: "/api/auth/login",
          me: "/api/auth/me",
        },
        users: "/api/users",
        categories: "/api/categories",
        products: "/api/products",
        stock: "/api/stock",
        suppliers: "/api/suppliers",
        purchases: "/api/purchases",
        cash_sessions: "/api/cash-sessions",
        transactions: "/api/transactions",
        health: "/api/health",
      },
    },
  });
});

/**
 * GET /api/health
 * Health Check Endpoint: Pengecekan status server & koneksi database
 */
export const checkDatabase = asyncHandler(
  async (_req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTimeMs = Date.now() - startTime;

      ApiResponse.success({
        res,
        data: {
          status: "ok",
          database: "connected",
          responseTime: `${responseTimeMs}ms`,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      ApiResponse.error({
        res,
        statusCode: 500,
        code: "DATABASE_DISCONNECTED",
        message: (error as Error).message,
      });
    }
  },
);
