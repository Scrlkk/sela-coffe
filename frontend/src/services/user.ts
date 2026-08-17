import { api } from "@/lib/axios";
import type { User } from "@/contexts/AuthContext";

export interface UserItem {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "CASHIER";
  phone?: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  isDeleted?: boolean;
}

export interface UpdateUserProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  password?: string;
  role?: "ADMIN" | "CASHIER";
}

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

const STORAGE_KEY = "sela_users_data";

export const getStoredUsers = (includeDeleted = false): UserItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const users: UserItem[] = data ? JSON.parse(data) : INITIAL_USERS;
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
    return includeDeleted ? users : users.filter((u) => !u.isDeleted);
  } catch {
    return includeDeleted
      ? INITIAL_USERS
      : INITIAL_USERS.filter((u) => !u.isDeleted);
  }
};

export const saveUsers = (users: UserItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Safe fallback
  }
};

export const addUser = (
  user: Omit<UserItem, "id"> & { password?: string },
): UserItem => {
  const all = getStoredUsers(true);
  const newUser: UserItem = {
    name: user.name,
    username: user.username,
    role: user.role,
    phone: user.phone || undefined,
    status: user.status ?? "ACTIVE",
    createdAt: new Date().toISOString(),
    id: `usr_${Date.now()}`,
    isDeleted: false,
  };
  const updated = [newUser, ...all];
  saveUsers(updated);
  return newUser;
};

export const updateUser = (
  id: string,
  updatedFields: Partial<UserItem> & { password?: string },
): UserItem | null => {
  const all = getStoredUsers(true);
  const index = all.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...all[index],
    ...updatedFields,
  };
  all[index] = updatedItem;
  saveUsers(all);
  return updatedItem;
};

export const softDeleteUser = (id: string): boolean => {
  const all = getStoredUsers(true);
  const index = all.findIndex((u) => u.id === id);
  if (index === -1) return false;

  all[index].isDeleted = true;
  all[index].status = "INACTIVE";
  saveUsers(all);
  return true;
};

export const restoreUser = (id: string): boolean => {
  const all = getStoredUsers(true);
  const index = all.findIndex((u) => u.id === id);
  if (index === -1) return false;

  all[index].isDeleted = false;
  all[index].status = "ACTIVE";
  saveUsers(all);
  return true;
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data?.data;
  },

  updateProfile: async (
    id: string | number,
    payload: UpdateUserProfilePayload,
  ): Promise<User> => {
    const res = await api.put(`/users/${id}`, payload);
    return res.data?.data;
  },
};
