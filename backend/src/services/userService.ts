import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";
import { CreateUserInput, UpdateUserInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ConflictError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export class UserService {
  static async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      deleted_at: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { username: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => {
        const { password_hash, ...rest } = u;
        return serializeBigInt(rest);
      }),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getUserById(id: bigint) {
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!user) throw new NotFoundError("User tidak ditemukan");
    const { password_hash, ...rest } = user;
    return serializeBigInt(rest);
  }

  static async createUser(input: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(input.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          username: input.username,
          password_hash: hashedPassword,
          phone: input.phone,
          is_active: input.is_active,
        },
      });

      const { password_hash, ...rest } = user;
      return serializeBigInt(rest);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Username sudah digunakan");
      }
      throw err;
    }
  }

  static async updateUser(id: bigint, input: UpdateUserInput) {
    await this.getUserById(id);

    const data: Record<string, unknown> = { ...input };
    if (input.password) {
      data.password_hash = await bcrypt.hash(input.password, 10);
      delete data.password;
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data,
      });

      const { password_hash, ...rest } = updated;
      return serializeBigInt(rest);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Username sudah digunakan oleh user lain");
      }
      throw err;
    }
  }

  static async softDeleteUser(id: bigint) {
    await this.getUserById(id);
    await prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
