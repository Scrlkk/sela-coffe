import { Request, Response, NextFunction } from "express";
import { PurchaseService } from "../services/purchaseService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";

export class PurchaseController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const supplierId = req.query.supplier_id
        ? BigInt(req.query.supplier_id as string)
        : undefined;
      const status = req.query.status as any;
      const search = req.query.search as string | undefined;

      const result = await PurchaseService.getPurchases(
        page,
        limit,
        supplierId,
        status,
        search,
      );

      return ApiResponse.success({
        res,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const purchase = await PurchaseService.getPurchaseById(id);
      return ApiResponse.success({ res, data: purchase });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const purchase = await PurchaseService.createPurchase(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Pembelian berhasil dibuat (Draft)",
        data: purchase,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const updated = await PurchaseService.updateStatus(id, req.body);
      return ApiResponse.success({
        res,
        message: "Status pembelian berhasil diperbarui",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
