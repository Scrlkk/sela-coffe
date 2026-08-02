import { Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";
import { ForbiddenError } from "../utils/errors";
import { AuthRequest } from "../middlewares/auth";

export class UserController {
  static async index(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = getPaginationParams(req.query);
      const search = req.query.search as string | undefined;

      const result = await UserService.getUsers(page, limit, search);
      return ApiResponse.success({
        res,
        data: result.data,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async show(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const user = await UserService.getUserById(id);
      return ApiResponse.success({ res, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "User berhasil dibuat",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);

      if (req.user?.role !== "ADMIN" && req.user?.id !== req.params.id) {
        throw new ForbiddenError(
          "Anda tidak memiliki akses untuk memperbarui profil user ini",
        );
      }

      const user = await UserService.updateUser(id, req.body);
      return ApiResponse.success({
        res,
        message: "User berhasil diperbarui",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      await UserService.softDeleteUser(id);
      return ApiResponse.success({
        res,
        message: "User berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }
}
