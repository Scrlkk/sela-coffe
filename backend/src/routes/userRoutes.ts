import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validate, numericIdParamSchema } from "../middlewares/validate";
import { authorize } from "../middlewares/auth";
import { createUserSchema, updateUserSchema } from "@sela/shared";

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Mengambil daftar user/kasir (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Berhasil mengambil daftar user
 *       403:
 *         description: Akses ditolak (Khusus Admin)
 *   post:
 *     summary: Membuat akun user/kasir baru (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, password]
 *             properties:
 *               name: { type: string, example: "Budi Kasir" }
 *               username: { type: string, example: "budi123" }
 *               password: { type: string, example: "secret123" }
 *               role: { type: string, enum: [ADMIN, CASHIER], default: CASHIER, example: "CASHIER" }
 *               phone: { type: string, example: "08123456789" }
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       403:
 *         description: Akses ditolak (Khusus Admin)
 */

router.get("/", authorize("ADMIN"), UserController.index);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Detail user berdasarkan ID (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail user ditemukan
 *       403:
 *         description: Akses ditolak (Khusus Admin)
 *   put:
 *     summary: Perbarui data user (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               role: { type: string, enum: [ADMIN, CASHIER] }
 *               phone: { type: string }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       403:
 *         description: Akses ditolak (Khusus Admin)
 *   delete:
 *     summary: Soft delete user (Khusus Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       403:
 *         description: Akses ditolak (Khusus Admin)
 */
router.get(
  "/:id",
  authorize("ADMIN"),
  validate(numericIdParamSchema),
  UserController.show,
);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createUserSchema),
  UserController.store,
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(numericIdParamSchema),
  validate(updateUserSchema),
  UserController.update,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(numericIdParamSchema),
  UserController.destroy,
);

export default router;
