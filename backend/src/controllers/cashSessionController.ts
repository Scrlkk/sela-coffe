import { Response, NextFunction } from "express";
import { CashSessionService } from "../services/cashSessionService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth";

export class CashSessionController {
  static async index(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUser = {
        id: BigInt(req.user!.id),
        role: req.user!.role,
      };

      const { page, limit } = getPaginationParams(req.query);
      const userId = req.query.user_id
        ? BigInt(req.query.user_id as string)
        : undefined;
      const status = req.query.status as any;

      const result = await CashSessionService.getSessions(
        page,
        limit,
        currentUser,
        userId,
        status,
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

  static async show(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUser = {
        id: BigInt(req.user!.id),
        role: req.user!.role,
      };
      const id = BigInt(req.params.id as string);
      const session = await CashSessionService.getSessionById(id, currentUser);
      return ApiResponse.success({ res, data: session });
    } catch (err) {
      next(err);
    }
  }

  static async open(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = {
        ...req.body,
        user_id: BigInt(req.user!.id),
      };
      const session = await CashSessionService.openSession(input);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Sesi kasir berhasil dibuka",
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  static async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = BigInt(req.params.id as string);
      const session = await CashSessionService.closeSession(id, req.body);
      return ApiResponse.success({
        res,
        message: "Sesi kasir berhasil ditutup",
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }
}
