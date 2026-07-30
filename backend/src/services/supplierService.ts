import { prisma } from "../db/prisma";
import { CreateSupplierInput, UpdateSupplierInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError } from "../utils/errors";

export class SupplierService {
  static async getSuppliers(
    page = 1,
    limit = 10,
    search?: string,
    isActiveOnly?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      deleted_at: null,
      ...(isActiveOnly ? { is_active: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              {
                contact_person: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      data: serializeBigInt(suppliers),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getSupplierById(id: bigint) {
    const supplier = await prisma.supplier.findFirst({
      where: { id, deleted_at: null },
    });
    if (!supplier) throw new NotFoundError("Supplier tidak ditemukan");
    return serializeBigInt(supplier);
  }

  static async createSupplier(input: CreateSupplierInput) {
    const supplier = await prisma.supplier.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        address: input.address,
        contact_person: input.contact_person,
        is_active: input.is_active,
      },
    });
    return serializeBigInt(supplier);
  }

  static async updateSupplier(id: bigint, input: UpdateSupplierInput) {
    await this.getSupplierById(id);

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.contact_person !== undefined
          ? { contact_person: input.contact_person }
          : {}),
        ...(input.is_active !== undefined
          ? { is_active: input.is_active }
          : {}),
      },
    });

    return serializeBigInt(updated);
  }

  static async softDeleteSupplier(id: bigint) {
    await this.getSupplierById(id);
    await prisma.supplier.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
