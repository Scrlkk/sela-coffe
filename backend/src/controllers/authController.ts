import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse } from "../utils/apiResponse";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success({
        res,
        message: "Login berhasil",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = BigInt((req as any).user.id);
      const user = await AuthService.me(userId);
      return ApiResponse.success({ res, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response) {
    return ApiResponse.success({
      res,
      message: "Logout berhasil, sesi Anda telah diakhiri.",
      data: null,
    });
  }
}
