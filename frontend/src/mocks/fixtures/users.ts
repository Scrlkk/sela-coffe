import type { UserItem } from "@/services/user";

export const INITIAL_USERS: UserItem[] = [
  {
    id: "usr_1",
    name: "Ahmad Fauzi",
    username: "admin_ahmad",
    role: "ADMIN",
    phone: "081234567890",
    status: "ACTIVE",
    createdAt: "2026-07-15T08:30:00.000Z",
    isDeleted: false,
  },
  {
    id: "usr_2",
    name: "Siti Rahmawati",
    username: "kasir_siti",
    role: "CASHIER",
    phone: "085678901234",
    status: "ACTIVE",
    createdAt: "2026-08-01T09:15:00.000Z",
    isDeleted: false,
  },
  {
    id: "usr_3",
    name: "Budi Santoso",
    username: "kasir_budi",
    role: "CASHIER",
    phone: "087711223344",
    status: "ACTIVE",
    createdAt: "2026-08-05T13:45:00.000Z",
    isDeleted: false,
  },
  {
    id: "usr_4",
    name: "Dian Permata",
    username: "admin_dian",
    role: "ADMIN",
    phone: "081987654321",
    status: "INACTIVE",
    createdAt: "2026-08-10T11:20:00.000Z",
    isDeleted: false,
  },
];
