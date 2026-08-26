import { api } from "@/lib/axios";
import type { User } from "@/contexts/AuthContext";
import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_USERS } from "@/mocks/fixtures";

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

const userCrud = createStorageCrud<UserItem>(
  "sela_users_data",
  INITIAL_USERS,
  {
    generateId: () => `usr_${Date.now()}`,
    onCreate: (item) => ({
      status: item.status ?? "ACTIVE",
      createdAt: new Date().toISOString(),
    }),
    onDelete: () => ({
      status: "INACTIVE",
    }),
    onRestore: () => ({
      status: "ACTIVE",
    }),
  },
);

export const getStoredUsers = (includeDeleted = false): UserItem[] => {
  return userCrud.get(includeDeleted);
};

export const saveUsers = (users: UserItem[]): void => {
  userCrud.save(users);
};

export const addUser = (
  user: Omit<UserItem, "id"> & { password?: string },
): UserItem => {
  return userCrud.add(user);
};

export const updateUser = (
  id: string,
  updatedFields: Partial<UserItem> & { password?: string },
): UserItem | null => {
  return userCrud.update(id, updatedFields);
};

export const softDeleteUser = (id: string): boolean => {
  return userCrud.softDelete(id);
};

export const restoreUser = (id: string): boolean => {
  return userCrud.restore(id);
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
