import { prisma } from "../db/prisma";
import { OpenCashSessionInput, CloseCashSessionInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ConflictError, ForbiddenError } from "../utils/errors";
import { Role } from "@prisma/client";

export class CashSessionService {
  static async getSessions(
    page = 1,
    limit = 10,
    currentUser: { id: bigint; role: Role },
    userId?: bigint,
    status?: "opened" | "closed",
  ) {
    const skip = (page - 1) * limit;
    const effectiveUserId =
      currentUser.role === "CASHIER" ? currentUser.id : userId;

    const where = {
      ...(effectiveUserId ? { user_id: effectiveUserId } : {}),
      ...(status ? { status } : {}),
    };

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { opened_at: "desc" },
        include: {
          user: {
            select: { id: true, name: true, username: true, role: true },
          },
          _count: { select: { transactions: true } },
        },
      }),
      prisma.cashSession.count({ where }),
    ]);

    return {
      data: serializeBigInt(sessions),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getSessionById(
    id: bigint,
    currentUser?: { id: bigint; role: Role },
  ) {
    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, username: true, role: true } },
        transactions: {
          select: {
            id: true,
            invoice_number: true,
            grand_total: true,
            payment_method: true,
            status: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundError("Sesi kasir tidak ditemukan");

    if (
      currentUser &&
      currentUser.role === "CASHIER" &&
      session.user_id !== currentUser.id
    ) {
      throw new ForbiddenError(
        "Akses ditolak: Anda tidak berhak melihat sesi kasir user lain",
      );
    }

    return serializeBigInt(session);
  }

  static async openSession(input: OpenCashSessionInput) {
    const activeSession = await prisma.cashSession.findFirst({
      where: { user_id: input.user_id, status: "opened" },
    });
    if (activeSession) {
      throw new ConflictError(
        "Kasir ini masih memiliki sesi kasir yang belum ditutup",
      );
    }

    const session = await prisma.cashSession.create({
      data: {
        user_id: input.user_id,
        opening_balance: input.opening_balance,
        status: "opened",
        note: input.note,
      },
    });

    return serializeBigInt(session);
  }

  static async closeSession(id: bigint, input: CloseCashSessionInput) {
    const session = await prisma.cashSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundError("Sesi kasir tidak ditemukan");
    if (session.status === "closed")
      throw new ConflictError("Sesi kasir sudah ditutup sebelumnya");

    const totalCashPaid = await prisma.transaction.aggregate({
      where: {
        cash_session_id: id,
        payment_method: "cash",
        status: "paid",
      },
      _sum: { grand_total: true },
    });

    const cashSales = Number(totalCashPaid._sum.grand_total || 0);
    const expectedBalance = Number(session.opening_balance) + cashSales;
    const difference = input.closing_balance - expectedBalance;

    const closedSession = await prisma.cashSession.update({
      where: { id },
      data: {
        closing_balance: input.closing_balance,
        expected_balance: expectedBalance,
        difference,
        status: "closed",
        closed_at: new Date(),
        ...(input.note ? { note: input.note } : {}),
      },
    });

    return serializeBigInt(closedSession);
  }
}
