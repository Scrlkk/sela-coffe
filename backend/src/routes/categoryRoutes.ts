import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Mengambil daftar kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar kategori
 *   post:
 *     summary: Membuat kategori baru
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Kopi Espresso" }
 *               description: { type: string, example: "Varian minuman espresso" }
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 */
router.get("/", CategoryController.index);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Detail kategori berdasarkan ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail kategori ditemukan
 *   put:
 *     summary: Perbarui data kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *   delete:
 *     summary: Soft delete kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus
 */
router.get("/:id", validate(numericIdParamSchema), CategoryController.show);
router.post("/", validate(createCategorySchema), CategoryController.store);
router.put(
  "/:id",
  validate(numericIdParamSchema),
  validate(updateCategorySchema),
  CategoryController.update,
);
router.delete(
  "/:id",
  validate(numericIdParamSchema),
  CategoryController.destroy,
);

export default router;
