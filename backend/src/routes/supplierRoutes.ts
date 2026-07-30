import { Router } from "express";
import { SupplierController } from "../controllers/supplierController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { createSupplierSchema, updateSupplierSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /suppliers:
 *   get:
 *     summary: Mengambil daftar supplier
 *     tags: [Suppliers]
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
 *         description: Berhasil mengambil daftar supplier
 *   post:
 *     summary: Membuat supplier baru
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name: { type: string, example: "PT Sangkar Kopi Utama" }
 *               phone: { type: string, example: "081122334455" }
 *               contact_person: { type: string, example: "Pak Ahmad" }
 *               email: { type: string, example: "supplier@kopi.com" }
 *               address: { type: string, example: "Jl. Merdeka No. 45 Bandung" }
 *     responses:
 *       201:
 *         description: Supplier berhasil dibuat
 */
router.get("/", SupplierController.index);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     summary: Detail supplier berdasarkan ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail supplier ditemukan
 *   patch:
 *     summary: Perbarui data supplier
 *     tags: [Suppliers]
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
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Supplier berhasil diperbarui
 *   delete:
 *     summary: Soft delete supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Supplier berhasil dihapus
 */
router.get("/:id", validate(numericIdParamSchema), SupplierController.show);
router.post("/", validate(createSupplierSchema), SupplierController.store);
router.patch(
  "/:id",
  validate(numericIdParamSchema),
  validate(updateSupplierSchema),
  SupplierController.update,
);
router.delete(
  "/:id",
  validate(numericIdParamSchema),
  SupplierController.destroy,
);

export default router;
