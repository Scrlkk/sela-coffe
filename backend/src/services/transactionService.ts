import { prisma } from "../db/prisma";
import { CreateTransactionInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors";
import { Prisma, Role } from "@prisma/client";

export class TransactionService {
  static async getTransactions(
    page = 1,
    limit = 10,
    currentUser: { id: bigint; role: Role },
    options?: {
      userId?: bigint;
      cashSessionId?: bigint;
      paymentMethod?: "cash" | "qris";
      status?: "paid" | "cancelled" | "refunded";
      search?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const skip = (page - 1) * limit;

    const effectiveUserId =
      currentUser.role === "CASHIER" ? currentUser.id : options?.userId;

    const where: any = {
      ...(effectiveUserId ? { user_id: effectiveUserId } : {}),
      ...(options?.cashSessionId
        ? { cash_session_id: options.cashSessionId }
        : {}),
      ...(options?.paymentMethod
        ? { payment_method: options.paymentMethod }
        : {}),
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.startDate || options?.endDate
        ? {
            transaction_date: {
              ...(options?.startDate ? { gte: options.startDate } : {}),
              ...(options?.endDate ? { lte: options.endDate } : {}),
            },
          }
        : {}),
      ...(options?.search
        ? {
            OR: [
              {
                invoice_number: {
                  contains: options.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: { id: true, name: true, username: true, role: true },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: serializeBigInt(transactions),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getTransactionById(
    id: bigint,
    currentUser?: { id: bigint; role: Role },
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, role: true } },
        cash_session: { select: { id: true, opened_at: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!transaction)
      throw new NotFoundError("Transaksi penjualan tidak ditemukan");

    if (
      currentUser &&
      currentUser.role === "CASHIER" &&
      transaction.user_id !== currentUser.id
    ) {
      throw new ForbiddenError(
        "Akses ditolak: Anda tidak berhak melihat transaksi user lain",
      );
    }

    return serializeBigInt(transaction);
  }

  /**
   * Membuat transaksi penjualan kasir (POS) secara atomik
   * Mengurangi stok di tabel `stock` dan mencatat `stock_logs` dalam 1 DB Transaction.
   */
  static async createTransaction(input: CreateTransactionInput) {
    let subtotal = 0;
    const itemsData = input.items.map((item: any) => {
      const itemSubtotal = item.quantity * item.unit_price;
      subtotal += itemSubtotal;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: itemSubtotal,
        note: item.note,
      };
    });

    const grandTotal = subtotal;
    if (input.paid_amount < grandTotal) {
      throw new ValidationError(
        `Jumlah pembayaran (${input.paid_amount}) kurang dari total belanja (${grandTotal})`,
      );
    }

    const changeAmount = input.paid_amount - grandTotal;

    try {
      return await prisma.$transaction(async (tx) => {
        for (const item of input.items) {
          const stock = await tx.stock.findUnique({
            where: { product_id: item.product_id },
          });

          if (!stock || stock.quantity < item.quantity) {
            throw new ValidationError(
              `Stok tidak mencukupi untuk produk ID #${item.product_id}`,
            );
          }
        }

        const transaction = await tx.transaction.create({
          data: {
            user_id: input.user_id,
            cash_session_id: input.cash_session_id,
            invoice_number: input.invoice_number,
            subtotal,
            grand_total: grandTotal,
            paid_amount: input.paid_amount,
            change_amount: changeAmount,
            payment_method: input.payment_method,
            status: "paid",
            note: input.note,
            items: {
              create: itemsData,
            },
          },
          include: { items: true },
        });

        for (const item of input.items) {
          const stock = await tx.stock.findUnique({
            where: { product_id: item.product_id },
          });

          const currentQty = stock?.quantity || 0;
          const newQty = currentQty - item.quantity;

          await tx.stock.update({
            where: { product_id: item.product_id },
            data: { quantity: newQty },
          });

          await tx.stockLog.create({
            data: {
              product_id: item.product_id,
              user_id: input.user_id,
              type: "out",
              quantity: item.quantity,
              quantity_before: currentQty,
              quantity_after: newQty,
              reference_type: "TRANSACTION",
              reference_id: transaction.id,
              note: `Penjualan Kasir - Invoice #${transaction.invoice_number}`,
            },
          });
        }

        return serializeBigInt(transaction);
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Nomor invoice transaksi sudah digunakan");
      }
      throw err;
    }
  }
}
