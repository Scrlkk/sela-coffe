import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";

const PORT = process.env.PORT || 3000;


process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server jalan di port ${PORT} (0.0.0.0)`);
});

