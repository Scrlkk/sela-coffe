import { prisma } from "../db/prisma";
import { AdjustStockInput, UpdateStockLimitsInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ValidationError } from "../utils/errors";

export class StockService {
  /**
   * Penyesuaian stok (Stock In, Out, atau Adjustment) secara atomik
   * Mengupdate tabel stock dan menambahkan record di stock_logs dalam 1 DB Transaction.
   */
  static async adjustStock(input: AdjustStockInput) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: input.product_id, deleted_at: null },
        include: { stock: true },
      });

      if (!product || !product.stock) {
        throw new NotFoundError("Produk atau data stok tidak ditemukan");
      }

      const user = await tx.user.findFirst({
        where: { id: input.user_id, deleted_at: null },
      });
      if (!user) {
        throw new NotFoundError("User tidak ditemukan");
      }

      const currentQuantity = product.stock.quantity;
      let newQuantity = currentQuantity;

      if (input.type === "in") {
        newQuantity += Math.abs(input.quantity);
      } else if (input.type === "out") {
        newQuantity -= Math.abs(input.quantity);
        if (newQuantity < 0) {
          throw new ValidationError(
            "Stok tidak mencukupi untuk pengurangan stok ini",
          );
        }
      } else if (input.type === "adjustment") {
        newQuantity = input.quantity;
        if (newQuantity < 0) {
          throw new ValidationError(
            "Jumlah stok hasil penyesuaian tidak boleh negatif",
          );
        }
      }

      const updatedStock = await tx.stock.update({
        where: { product_id: input.product_id },
        data: { quantity: newQuantity },
      });
      const stockLog = await tx.stockLog.create({
        data: {
          product_id: input.product_id,
          user_id: input.user_id,
          type: input.type,
          quantity:
            input.type === "adjustment"
              ? newQuantity - currentQuantity
              : input.quantity,
          quantity_before: currentQuantity,
          quantity_after: newQuantity,
          reference_type: input.reference_type || "ADJUSTMENT",
          reference_id: input.reference_id,
          note: input.note,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, username: true } },
        },
      });

      return serializeBigInt({
        stock: updatedStock,
        log: stockLog,
      });
    });
  }

  static async getStockLogs(
    page = 1,
    limit = 10,
    options?: {
      productId?: bigint;
      userId?: bigint;
      type?: "in" | "out" | "adjustment";
      referenceType?: string;
      search?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(options?.productId ? { product_id: options.productId } : {}),
      ...(options?.userId ? { user_id: options.userId } : {}),
      ...(options?.type ? { type: options.type } : {}),
      ...(options?.referenceType
        ? { reference_type: options.referenceType }
        : {}),
      ...(options?.startDate || options?.endDate
        ? {
            created_at: {
              ...(options?.startDate ? { gte: options.startDate } : {}),
              ...(options?.endDate ? { lte: options.endDate } : {}),
            },
          }
        : {}),
      ...(options?.search
        ? {
            product: {
              OR: [
                {
                  name: {
                    contains: options.search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  sku: {
                    contains: options.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.stockLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          user: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.stockLog.count({ where }),
    ]);

    return {
      data: serializeBigInt(logs),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getStockLogById(id: bigint) {
    const log = await prisma.stockLog.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user: { select: { id: true, name: true, username: true } },
      },
    });

    if (!log) throw new NotFoundError("Log pergerakan stok tidak ditemukan");

    return serializeBigInt(log);
  }

  static async getStockSummary(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate || endDate
        ? {
            created_at: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [totalLogs, logsGrouped] = await Promise.all([
      prisma.stockLog.count({ where }),
      prisma.stockLog.groupBy({
        by: ["type"],
        where,
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const summary = {
      total_logs: totalLogs,
      total_in: 0,
      total_out: 0,
      total_adjustment: 0,
    };

    logsGrouped.forEach((group) => {
      if (group.type === "in")
        summary.total_in = Math.abs(group._sum.quantity || 0);
      if (group.type === "out")
        summary.total_out = Math.abs(group._sum.quantity || 0);
      if (group.type === "adjustment")
        summary.total_adjustment = Math.abs(group._sum.quantity || 0);
    });

    return summary;
  }

  static async getLowStockProducts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [lowStocks, total] = await Promise.all([
      prisma.stock.findMany({
        where: {
          product: { deleted_at: null },
          quantity: { lte: prisma.stock.fields.min_stock },
        },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      prisma.stock.count({
        where: {
          product: { deleted_at: null },
          quantity: { lte: prisma.stock.fields.min_stock },
        },
      }),
    ]);

    const sanitizedData = lowStocks.map((s) => ({
      id: String(s.id),
      product_id: String(s.product_id),
      quantity: s.quantity,
      min_stock: s.min_stock,
      max_stock: s.max_stock,
      product: {
        ...s.product,
        id: String(s.product.id),
      },
    }));

    return {
      data: sanitizedData,
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async updateStockLimits(
    productId: bigint,
    input: UpdateStockLimitsInput,
  ) {
    const existing = await prisma.stock.findUnique({
      where: { product_id: productId },
    });
    if (!existing)
      throw new NotFoundError("Data stok untuk produk ini tidak ditemukan");

    const updated = await prisma.stock.update({
      where: { product_id: productId },
      data: {
        ...(input.min_stock !== undefined
          ? { min_stock: input.min_stock }
          : {}),
        ...(input.max_stock !== undefined
          ? { max_stock: input.max_stock }
          : {}),
      },
    });

    return {
      ...updated,
      id: String(updated.id),
      product_id: String(updated.product_id),
    };
  }
}
