import { Response, NextFunction } from "express";
import { TransactionService } from "../services/transactionService";
import { getPaginationParams } from "../utils/pagination";
import { ApiResponse } from "../utils/apiResponse";
import { AuthRequest } from "../middlewares/auth";

export class TransactionController {
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
      const cashSessionId = req.query.cash_session_id
        ? BigInt(req.query.cash_session_id as string)
        : undefined;
      const paymentMethod = req.query.payment_method as any;
      const status = req.query.status as any;
      const search = req.query.search as string | undefined;
      const startDate = req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined;
      const endDate = req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined;

      const result = await TransactionService.getTransactions(
        page,
        limit,
        currentUser,
        {
          userId,
          cashSessionId,
          paymentMethod,
          status,
          search,
          startDate,
          endDate,
        },
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
      const transaction = await TransactionService.getTransactionById(
        id,
        currentUser,
      );
      return ApiResponse.success({ res, data: transaction });
    } catch (err) {
      next(err);
    }
  }

  static async store(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = {
        ...req.body,
        user_id: BigInt(req.user!.id),
      };
      const transaction = await TransactionService.createTransaction(input);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: "Transaksi penjualan berhasil disimpan",
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  }
}
