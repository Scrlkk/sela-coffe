import { Router } from "express";
import { TransactionController } from "../controllers/transactionController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { createTransactionSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: Riwayat transaksi penjualan (POS)
 *     tags: [Transactions]
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
 *         description: Berhasil mengambil daftar transaksi
 *   post:
 *     summary: Buat transaksi penjualan POS baru
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, cash_session_id, invoice_number, paid_amount, payment_method, items]
 *             properties:
 *               user_id: { type: string, example: "1" }
 *               cash_session_id: { type: string, example: "1" }
 *               invoice_number: { type: string, example: "TRX-20260726-0001" }
 *               paid_amount: { type: number, example: 50000 }
 *               payment_method: { type: string, example: "cash" }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: string, example: "1" }
 *                     quantity: { type: integer, example: 2 }
 *                     unit_price: { type: number, example: 18000 }
 *     responses:
 *       201:
 *         description: Transaksi berhasil disimpan
 */
router.get("/", TransactionController.index);

/**
 * @openapi
 * /transactions/{id}:
 *   get:
 *     summary: Detail transaksi penjualan
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail transaksi ditemukan
 */
router.get("/:id", validate(numericIdParamSchema), TransactionController.show);
router.post(
  "/",
  validate(createTransactionSchema),
  TransactionController.store,
);

export default router;
