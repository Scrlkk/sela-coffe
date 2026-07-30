import { Request, Response, NextFunction } from "express";
import { SupplierService } from "../services/supplierService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";

export class SupplierController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.search as string | undefined;
      const isActiveOnly = req.query.is_active === "true";

      const result = await SupplierService.getSuppliers(
        page,
        limit,
        search,
        isActiveOnly,
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
      const supplier = await SupplierService.getSupplierById(id);
      return ApiResponse.success({ res, data: supplier });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.createSupplier(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Supplier berhasil dibuat",
        data: supplier,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const supplier = await SupplierService.updateSupplier(id, req.body);
      return ApiResponse.success({
        res,
        message: "Supplier berhasil diperbarui",
        data: supplier,
      });
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      await SupplierService.softDeleteSupplier(id);
      return ApiResponse.success({
        res,
        message: "Supplier berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }
}
