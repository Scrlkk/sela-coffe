import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema } from "@sela/shared";
import { authenticate } from "../middlewares/auth";
import { loginRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Autentikasi & Login Kasir / Admin
 *     description: Endpoint utama untuk melakukan verifikasi identitas kasir/admin menggunakan username & password. Menghasilkan JWT token yang dapat digunakan pada header Authorization `Bearer <token>` untuk mengakses endpoint terproteksi.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *                 description: Username terdaftar kasir atau admin
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Password akun (minimal 6 karakter)
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan profil user & JWT Token
 *       401:
 *         description: Gagal autentikasi (Username/password salah atau akun non-aktif)
 *       429:
 *         description: Terlalu banyak percobaan login (Rate limit exceeded)
 *       422:
 *         description: Format input payload tidak valid
 */
router.post("/login", loginRateLimiter, validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Mengambil Profil User Aktif (Current Session)
 *     description: Mengambil data identitas user/kasir yang sedang aktif berdasarkan token JWT yang dikirimkan pada header `Authorization`.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Informasi profil user berhasil ditemukan
 *       401:
 *         description: Token JWT tidak ditemukan, kadaluwarsa, atau tidak valid
 */
router.get("/me", authenticate, AuthController.me);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout User / Akhiri Sesi
 *     description: Mengakhiri sesi kasir/admin. Frontend harus menghapus token JWT dari penyimpanan lokal client.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       401:
 *         description: Token tidak valid atau tidak dikirim
 */
router.post("/logout", authenticate, AuthController.logout);

export default router;
