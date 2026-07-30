import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: {
    status: false,
    code: "TOO_MANY_REQUESTS",
    message:
      "Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
