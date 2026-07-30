import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/productService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";

export class ProductController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.search as string | undefined;
      const categoryId = req.query.category_id
        ? BigInt(req.query.category_id as string)
        : undefined;
      const isActiveOnly = req.query.is_active === "true";

      const result = await ProductService.getProducts(
        page,
        limit,
        search,
        categoryId,
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
      const product = await ProductService.getProductById(id);
      return ApiResponse.success({ res, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Produk berhasil dibuat",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const product = await ProductService.updateProduct(id, req.body);
      return ApiResponse.success({
        res,
        message: "Produk berhasil diperbarui",
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      await ProductService.softDeleteProduct(id);
      return ApiResponse.success({
        res,
        message: "Produk berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }
}
