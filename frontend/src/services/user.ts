import { api } from "@/lib/axios";
import type { User } from "@/contexts/auth-context";

export interface UpdateUserProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  password?: string;
}

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
