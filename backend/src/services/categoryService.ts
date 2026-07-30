import { prisma } from "../db/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ConflictError } from "../utils/errors";
import { Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CategoryService {
  static async getCategories(
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
              { slug: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: serializeBigInt(categories),
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getCategoryById(id: bigint) {
    const category = await prisma.category.findFirst({
      where: { id, deleted_at: null },
    });
    if (!category) throw new NotFoundError("Kategori tidak ditemukan");
    return serializeBigInt(category);
  }

  static async createCategory(input: CreateCategoryInput) {
    const slug = input.slug || slugify(input.name);

    try {
      const category = await prisma.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          image: input.image,
          is_active: input.is_active ?? true,
        },
      });

      return serializeBigInt(category);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Slug atau Nama Kategori sudah digunakan");
      }
      throw err;
    }
  }

  static async updateCategory(id: bigint, input: UpdateCategoryInput) {
    await this.getCategoryById(id);

    let slug: string | undefined = input.slug;
    if (!slug && input.name) {
      slug = slugify(input.name);
    }

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(slug ? { slug } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.image !== undefined ? { image: input.image } : {}),
          ...(input.is_active !== undefined
            ? { is_active: input.is_active }
            : {}),
        },
      });

      return serializeBigInt(updated);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError(
          "Slug atau Nama Kategori sudah digunakan oleh kategori lain",
        );
      }
      throw err;
    }
  }

  static async softDeleteCategory(id: bigint) {
    await this.getCategoryById(id);
    await prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
