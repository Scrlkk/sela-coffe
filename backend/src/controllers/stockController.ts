import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stockService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth";

export class StockController {
  static async adjust(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = {
        ...req.body,
        user_id: BigInt(req.user!.id),
      };
      const result = await StockService.adjustStock(input);

      return ApiResponse.success({
        res,
        statusCode: 200,
        message: "Penyesuaian stok berhasil disimpan",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const productId = req.query.product_id
        ? BigInt(req.query.product_id as string)
        : undefined;
      const userId = req.query.user_id
        ? BigInt(req.query.user_id as string)
        : undefined;
      const type = req.query.type as "in" | "out" | "adjustment" | undefined;
      const referenceType = req.query.reference_type as string | undefined;
      const search = req.query.search as string | undefined;
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      const result = await StockService.getStockLogs(page, limit, {
        productId,
        userId,
        type,
        referenceType,
        search,
        startDate,
        endDate,
      });

      return ApiResponse.success({
        res,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async showLog(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const log = await StockService.getStockLogById(id);
      return ApiResponse.success({ res, data: log });
    } catch (err) {
      next(err);
    }
  }

  static async logSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      const summary = await StockService.getStockSummary(startDate, endDate);

      return ApiResponse.success({
        res,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  static async lowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const result = await StockService.getLowStockProducts(page, limit);

      return ApiResponse.success({
        res,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateLimits(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = BigInt(req.params.productId as string);
      const updated = await StockService.updateStockLimits(productId, req.body);

      return ApiResponse.success({
        res,
        message: "Batas stok berhasil diperbarui",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
