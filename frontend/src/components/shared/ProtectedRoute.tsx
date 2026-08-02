import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SelaLogo } from "@/components/shared/SelaLogo";
import { Loader2 } from "lucide-react";

export const SessionLoading = () => {
  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col items-center justify-center z-50 select-none">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-2 rounded-2xl bg-primary/10 animate-pulse duration-1000" />
          <div className="w-16 h-16 rounded-2xl bg-card border border-border/80 shadow-md flex items-center justify-center p-3 relative z-10">
            <SelaLogo className="w-10 h-10 text-primary shrink-0" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-1 mt-1">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs font-bold tracking-wider uppercase text-foreground/80">
              Loading Session
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            Preparing your coffee shop workspace...
          </p>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  const [minLoading, setMinLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || minLoading) return <SessionLoading />;
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export const PublicRoute = () => {
  const { token, loading } = useAuth();
  const [minLoading, setMinLoading] = useState<boolean>(Boolean(token));

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => setMinLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [token]);

  if (loading || (token && minLoading)) return <SessionLoading />;
  if (token) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};
