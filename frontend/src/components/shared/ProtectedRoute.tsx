import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Loading session...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export const PublicRoute = () => {
  const { token, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Loading session...</div>;
  if (token) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
