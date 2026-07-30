import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { createProductSchema, updateProductSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Mengambil daftar produk
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar produk
 *   post:
 *     summary: Membuat produk baru
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category_id, name, sku, price]
 *             properties:
 *               category_id: { type: string, example: "1" }
 *               name: { type: string, example: "Espresso Single" }
 *               sku: { type: string, example: "ESP-001" }
 *               price: { type: number, example: 18000 }
 *     responses:
 *       201:
 *         description: Produk berhasil dibuat
 */
router.get("/", ProductController.index);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Mengambil detail produk berdasarkan ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail produk ditemukan
 *       404:
 *         description: Produk tidak ditemukan
 *   patch:
 *     summary: Perbarui data produk
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Produk berhasil diperbarui
 *   delete:
 *     summary: Soft delete produk
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 */
router.get("/:id", validate(numericIdParamSchema), ProductController.show);
router.post("/", validate(createProductSchema), ProductController.store);
router.patch(
  "/:id",
  validate(numericIdParamSchema),
  validate(updateProductSchema),
  ProductController.update,
);
router.delete(
  "/:id",
  validate(numericIdParamSchema),
  ProductController.destroy,
);

export default router;
