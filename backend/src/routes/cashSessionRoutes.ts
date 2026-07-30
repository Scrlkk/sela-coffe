import { Router } from "express";
import { CashSessionController } from "../controllers/cashSessionController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { openCashSessionSchema, closeCashSessionSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /cash-sessions:
 *   get:
 *     summary: Daftar riwayat sesi kasir
 *     tags: [Cash Sessions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: user_id
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [opened, closed] }
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar sesi kasir
 */
router.get("/", CashSessionController.index);

/**
 * @openapi
 * /cash-sessions/open:
 *   post:
 *     summary: Buka sesi kasir baru (shift baru)
 *     tags: [Cash Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, opening_balance]
 *             properties:
 *               user_id: { type: string, example: "1" }
 *               opening_balance: { type: number, example: 500000 }
 *               note: { type: string, example: "Shift Pagi Kasir" }
 *     responses:
 *       201:
 *         description: Sesi kasir berhasil dibuka
 */
router.post(
  "/open",
  validate(openCashSessionSchema),
  CashSessionController.open,
);

/**
 * @openapi
 * /cash-sessions/{id}:
 *   get:
 *     summary: Detail sesi kasir
 *     tags: [Cash Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail sesi kasir ditemukan
 */
router.get("/:id", validate(numericIdParamSchema), CashSessionController.show);

/**
 * @openapi
 * /cash-sessions/{id}/close:
 *   post:
 *     summary: Tutup sesi kasir & hitung selisih kas
 *     tags: [Cash Sessions]
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
 *             required: [closing_balance]
 *             properties:
 *               closing_balance: { type: number, example: 850000 }
 *               note: { type: string, example: "Tutup shift sore" }
 *     responses:
 *       200:
 *         description: Sesi kasir berhasil ditutup
 */
router.post(
  "/:id/close",
  validate(numericIdParamSchema),
  validate(closeCashSessionSchema),
  CashSessionController.close,
);

export default router;
