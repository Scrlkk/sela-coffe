import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { LoginInput } from "@sela/shared";
import { serializeBigInt } from "../utils/serializer";
import { UnauthorizedError } from "../utils/errors";

const JWT_SECRET =
  process.env.JWT_SECRET || "sela-pos-secret-key-change-in-prod";
const JWT_EXPIRES_IN = "1d";

export class AuthService {
  static async login(input: LoginInput & { rememberMe?: boolean }) {
    const user = await prisma.user.findFirst({
      where: {
        username: input.username,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Username atau password salah");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("Akun user ini sedang tidak aktif");
    }

    const isPasswordMatch = await bcrypt.compare(
      input.password,
      user.password_hash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedError("Username atau password salah");
    }

    const expiresIn = input.rememberMe ? "7d" : "1d";

    const token = jwt.sign(
      {
        id: String(user.id),
        username: user.username,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn },
    );

    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: serializeBigInt(userWithoutPassword),
      token,
    };
  }

  static async me(userId: bigint) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user)
      throw new UnauthorizedError("User tidak ditemukan atau sesi berakhir");
    const { password_hash, ...rest } = user;
    return serializeBigInt(rest);
  }
}
