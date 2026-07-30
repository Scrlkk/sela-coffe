import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { Role } from "@prisma/client";

const JWT_SECRET =
  process.env.JWT_SECRET || "sela-pos-secret-key-change-in-prod";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError(
        "Akses ditolak: Anda belum login atau token JWT tidak ditemukan",
      ),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    req.user = decoded;
    next();
  } catch (err) {
    return next(
      new UnauthorizedError(
        "Akses ditolak: Sesi login telah berakhir atau token tidak valid",
      ),
    );
  }
};

/**
 * Middleware RBAC untuk memverifikasi wewenang user berdasarkan role
 * ponytail: simple allow-list guard
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Akses ditolak: Anda belum login"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          "Akses ditolak: Anda tidak memiliki wewenang untuk fitur ini",
        ),
      );
    }

    next();
  };
};
