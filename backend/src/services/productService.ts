import { prisma } from "../db/prisma";
import { CreateProductInput, UpdateProductInput } from "@sela/shared";
import { createPaginatedMeta } from "../utils/pagination";
import { serializeBigInt } from "../utils/serializer";
import { NotFoundError, ConflictError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export class ProductService {
  static async getProducts(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: bigint,
    isActiveOnly?: boolean,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      deleted_at: null,
      ...(isActiveOnly ? { is_active: true } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { sku: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          stock: {
            select: { quantity: true, min_stock: true, max_stock: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const sanitizedData = serializeBigInt(products);

    return {
      data: sanitizedData,
      meta: createPaginatedMeta(total, { page, limit }),
    };
  }

  static async getProductById(id: bigint) {
    const product = await prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: {
        category: true,
        stock: true,
      },
    });

    if (!product) throw new NotFoundError("Produk tidak ditemukan");

    return serializeBigInt(product);
  }

  static async createProduct(input: CreateProductInput) {
    const category = await prisma.category.findFirst({
      where: { id: input.category_id, deleted_at: null },
    });
    if (!category) {
      throw new NotFoundError("Kategori tidak ditemukan");
    }

    try {
      const newProduct = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            category_id: input.category_id,
            name: input.name,
            sku: input.sku,
            description: input.description,
            cost_price: input.cost_price,
            price: input.price,
            image: input.image,
            weight: input.weight,
            unit: input.unit,
            is_active: input.is_active,
          },
        });

        const stock = await tx.stock.create({
          data: {
            product_id: product.id,
            quantity: input.initial_stock || 0,
            min_stock: input.min_stock || 5,
            max_stock: input.max_stock || 100,
          },
        });

        return { ...product, stock };
      });

      return serializeBigInt(newProduct);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("SKU produk sudah digunakan");
      }
      throw err;
    }
  }

  static async updateProduct(id: bigint, input: UpdateProductInput) {
    await this.getProductById(id);

    if (input.category_id) {
      const category = await prisma.category.findFirst({
        where: { id: input.category_id, deleted_at: null },
      });
      if (!category) throw new NotFoundError("Kategori tidak ditemukan");
    }

    try {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(input.category_id ? { category_id: input.category_id } : {}),
          ...(input.name ? { name: input.name } : {}),
          ...(input.sku ? { sku: input.sku } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.cost_price !== undefined
            ? { cost_price: input.cost_price }
            : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.image !== undefined ? { image: input.image } : {}),
          ...(input.weight !== undefined ? { weight: input.weight } : {}),
          ...(input.unit !== undefined ? { unit: input.unit } : {}),
          ...(input.is_active !== undefined
            ? { is_active: input.is_active }
            : {}),
        },
        include: {
          stock: true,
        },
      });

      return serializeBigInt(updated);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("SKU produk sudah digunakan oleh produk lain");
      }
      throw err;
    }
  }

  static async softDeleteProduct(id: bigint) {
    await this.getProductById(id);
    await prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
