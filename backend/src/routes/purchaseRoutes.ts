import { Router } from "express";
import { PurchaseController } from "../controllers/purchaseController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { createPurchaseSchema, updatePurchaseStatusSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /purchases:
 *   get:
 *     summary: Daftar transaksi pembelian dari supplier
 *     tags: [Purchases]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: supplier_id
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, ordered, received, cancelled] }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar pembelian
 *   post:
 *     summary: Buat transaksi pembelian baru (Draft)
 *     tags: [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier_id, user_id, invoice_number, purchase_date, items]
 *             properties:
 *               supplier_id: { type: string, example: "1" }
 *               user_id: { type: string, example: "1" }
 *               invoice_number: { type: string, example: "INV-SUP-20260726-01" }
 *               purchase_date: { type: string, example: "2026-07-26T00:00:00.000Z" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: string, example: "1" }
 *                     quantity: { type: integer, example: 50 }
 *                     unit_price: { type: number, example: 12000 }
 *     responses:
 *       201:
 *         description: Pembelian berhasil dibuat
 */
router.get("/", PurchaseController.index);

/**
 * @openapi
 * /purchases/{id}:
 *   get:
 *     summary: Detail transaksi pembelian
 *     tags: [Purchases]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail pembelian ditemukan
 */
router.get("/:id", validate(numericIdParamSchema), PurchaseController.show);
router.post("/", validate(createPurchaseSchema), PurchaseController.store);

/**
 * @openapi
 * /purchases/{id}/status:
 *   patch:
 *     summary: Perbarui status pembelian (Jika 'received', stok bertambah otomatis)
 *     tags: [Purchases]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [draft, ordered, received, cancelled], example: "received" }
 *     responses:
 *       200:
 *         description: Status pembelian berhasil diperbarui
 */
router.patch(
  "/:id/status",
  validate(numericIdParamSchema),
  validate(updatePurchaseStatusSchema),
  PurchaseController.updateStatus,
);

export default router;
