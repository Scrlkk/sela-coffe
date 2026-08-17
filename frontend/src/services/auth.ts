import { api } from "@/lib/axios";
import type { User } from "@/contexts/AuthContext";

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", payload);
    return res.data?.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
