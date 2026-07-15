import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const getHome = asyncHandler(async (req: Request, res: Response) => {
  res.json({ message: "Halo dari Express Backend (TypeScript) dengan Struktur MVC!" });
});
