import { prisma } from "../db/prisma";
import { CreatePurchaseInput, UpdatePurchaseStatusInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ConflictError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export class PurchaseService {
  static async getPurchases(
    page = 1,
    limit = 10,
    supplierId?: bigint,
    status?: "draft" | "ordered" | "received" | "cancelled",
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      deleted_at: null,
      ...(supplierId ? { supplier_id: supplierId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                invoice_number: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          supplier: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, username: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    return {
      data: serializeBigInt(purchases),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getPurchaseById(id: bigint) {
    const purchase = await prisma.purchase.findFirst({
      where: { id, deleted_at: null },
      include: {
        supplier: true,
        user: { select: { id: true, name: true, username: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, unit: true },
            },
          },
        },
      },
    });

    if (!purchase)
      throw new NotFoundError("Transaksi Pembelian tidak ditemukan");

    return serializeBigInt(purchase);
  }

  static async createPurchase(input: CreatePurchaseInput) {
    let totalAmount = 0;
    const itemsData = input.items.map((item: any) => {
      const subtotal = item.quantity * item.unit_price;
      totalAmount += subtotal;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
      };
    });

    try {
      const newPurchase = await prisma.purchase.create({
        data: {
          supplier_id: input.supplier_id,
          user_id: input.user_id,
          invoice_number: input.invoice_number,
          purchase_date: input.purchase_date,
          total_amount: totalAmount,
          grand_total: totalAmount,
          status: "draft",
          note: input.note,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      return serializeBigInt(newPurchase);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Nomor invoice sudah digunakan");
      }
      throw err;
    }
  }

  static async updateStatus(id: bigint, input: UpdatePurchaseStatusInput) {
    const purchase = await this.getPurchaseById(id);
    if (purchase.status === input.status) return purchase;
    if (purchase.status === "received") {
      throw new ConflictError(
        "Pembelian yang sudah diterima (received) tidak dapat diubah lagi statusnya",
      );
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.purchase.update({
        where: { id },
        data: { status: input.status },
        include: { items: true },
      });

      if (input.status === "received") {
        for (const item of updated.items) {
          const stock = await tx.stock.findUnique({
            where: { product_id: item.product_id },
          });

          const currentQty = stock?.quantity || 0;
          const newQty = currentQty + item.quantity;

          await tx.stock.upsert({
            where: { product_id: item.product_id },
            update: { quantity: newQty },
            create: { product_id: item.product_id, quantity: newQty },
          });

          await tx.stockLog.create({
            data: {
              product_id: item.product_id,
              user_id: BigInt(purchase.user_id),
              type: "in",
              quantity: item.quantity,
              quantity_before: currentQty,
              quantity_after: newQty,
              reference_type: "PURCHASE",
              reference_id: id,
              note: `Pembelian dari Supplier - Invoice #${purchase.invoice_number}`,
            },
          });
        }
      }

      return serializeBigInt(updated);
    });
  }
}
