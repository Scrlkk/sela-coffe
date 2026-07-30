import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password_hash: hashedPassword,
      name: "Super Admin Sela",
      role: "ADMIN",
      is_active: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      username: "kasir",
      password_hash: hashedPassword,
      name: "Kasir Sela Coffee",
      role: "CASHIER",
      is_active: true,
    },
  });

  console.log("Seeding completed successfully!");
  console.log({
    admin: { username: admin.username, role: admin.role },
    cashier: { username: cashier.username, role: cashier.role },
  });
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
