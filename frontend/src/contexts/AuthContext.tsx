import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { safeStorage } from "@/utils/storage";

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  phone?: string;
  is_active?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    safeStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(
    Boolean(safeStorage.getItem("token")),
  );

  const login = (newToken: string, newUser: User) => {
    safeStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    safeStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
