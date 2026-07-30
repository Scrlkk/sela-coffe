import { Router } from "express";
import { StockController } from "../controllers/stockController";
import {
  validate,
  numericIdParamSchema,
  customParamIdSchema,
} from "../middlewares/validate";
import { adjustStockSchema, updateStockLimitsSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /stock/logs:
 *   get:
 *     summary: Riwayat mutasi/pergerakan stok
 *     tags: [Stock Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: product_id
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [in, out, adjustment] }
 *     responses:
 *       200:
 *         description: Berhasil mengambil log pergerakan stok
 */
router.get("/logs", StockController.logs);

/**
 * @openapi
 * /stock/logs/summary:
 *   get:
 *     summary: Statistik ringkasan mutasi stok (Total in, out, adjustment)
 *     tags: [Stock Management]
 *     responses:
 *       200:
 *         description: Ringkasan mutasi stok berhasil dihitung
 */
router.get("/logs/summary", StockController.logSummary);

/**
 * @openapi
 * /stock/logs/{id}:
 *   get:
 *     summary: Detail 1 record log stok
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail log stok ditemukan
 */
router.get(
  "/logs/:id",
  validate(numericIdParamSchema),
  StockController.showLog,
);

/**
 * @openapi
 * /stock/low-stock:
 *   get:
 *     summary: Daftar produk dengan stok menipis (quantity <= min_stock)
 *     tags: [Stock Management]
 *     responses:
 *       200:
 *         description: Berhasil mengambil produk stok menipis
 */
router.get("/low-stock", StockController.lowStock);

/**
 * @openapi
 * /stock/adjust:
 *   post:
 *     summary: Penyesuaian stok (Stock In, Stock Out, atau Stock Adjustment)
 *     tags: [Stock Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, user_id, type, quantity]
 *             properties:
 *               product_id: { type: string, example: "1" }
 *               user_id: { type: string, example: "1" }
 *               type: { type: string, enum: [in, out, adjustment], example: "in" }
 *               quantity: { type: integer, example: 10 }
 *               note: { type: string, example: "Barang datang dari supplier" }
 *     responses:
 *       200:
 *         description: Penyesuaian stok berhasil disimpan
 */
router.post("/adjust", validate(adjustStockSchema), StockController.adjust);

/**
 * @openapi
 * /stock/{productId}/limits:
 *   patch:
 *     summary: Atur batas minimum dan maksimum stok produk
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               min_stock: { type: integer, example: 5 }
 *               max_stock: { type: integer, example: 100 }
 *     responses:
 *       200:
 *         description: Batas stok berhasil diperbarui
 */
router.patch(
  "/:productId/limits",
  validate(customParamIdSchema("productId")),
  validate(updateStockLimitsSchema),
  StockController.updateLimits,
);

export default router;
