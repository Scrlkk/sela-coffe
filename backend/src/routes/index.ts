import { Router } from "express";
import * as homeController from "../controllers/homeController";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import stockRoutes from "./stockRoutes";
import supplierRoutes from "./supplierRoutes";
import purchaseRoutes from "./purchaseRoutes";
import cashSessionRoutes from "./cashSessionRoutes";
import transactionRoutes from "./transactionRoutes";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/", homeController.getHome);
router.get("/health", homeController.checkDatabase);
router.use("/auth", authRoutes);
router.use("/users", authenticate, userRoutes);
router.use("/categories", authenticate, categoryRoutes);
router.use("/products", authenticate, productRoutes);
router.use("/stock", authenticate, stockRoutes);
router.use("/suppliers", authenticate, supplierRoutes);
router.use("/purchases", authenticate, purchaseRoutes);
router.use("/cash-sessions", authenticate, cashSessionRoutes);
router.use("/transactions", authenticate, transactionRoutes);

export default router;
