import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/categoryService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";

export class CategoryController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.search as string | undefined;
      const isActiveOnly = req.query.is_active === "true";

      const result = await CategoryService.getCategories(
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
      const category = await CategoryService.getCategoryById(id);
      return ApiResponse.success({ res, data: category });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Kategori berhasil dibuat",
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const category = await CategoryService.updateCategory(id, req.body);
      return ApiResponse.success({
        res,
        message: "Kategori berhasil diperbarui",
        data: category,
      });
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      await CategoryService.softDeleteCategory(id);
      return ApiResponse.success({
        res,
        message: "Kategori berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }
}
