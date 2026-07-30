import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sela POS API",
      version: "1.0.0",
      description:
        "Dokumentasi Interactive OpenAPI (Swagger) untuk Sela Coffee POS Backend.",
    },
    servers: [
      {
        url: "/api",
        description: "API Base URL",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Endpoint Autentikasi & Login User",
      },
      { name: "Users", description: "Manajemen Data User & Kasir" },
      { name: "Categories", description: "Manajemen Kategori Produk" },
      { name: "Products", description: "Katalog & Data Produk" },
      { name: "Stock Management", description: "Manajemen & Log Mutasi Stok" },
      { name: "Cash Sessions", description: "Sesi Shift Kasir POS" },
      { name: "Transactions", description: "Transaksi Penjualan POS" },
      { name: "Purchases", description: "Transaksi Pembelian Supplier" },
      { name: "Suppliers", description: "Manajemen Data Supplier" },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Masukkan token JWT di sini untuk autentikasi API mendatang.",
        },
      },
      schemas: {
        StandardSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operasi berhasil" },
            data: { type: "object" },
          },
        },
        StandardErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "Validasi data gagal" },
                details: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const setupSwagger = (app: Express) => {
  if (process.env.NODE_ENV !== "production") {
    app.use("/api/docs", swaggerUi.serve, (req: any, res: any, next: any) => {
      const dynamicSpec = swaggerJsdoc(options);
      swaggerUi.setup(dynamicSpec, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      })(req, res, next);
    });
  } else {
    const swaggerSpec = swaggerJsdoc(options);
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};
