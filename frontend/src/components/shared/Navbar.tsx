import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import { CloseSessionDialog } from "@/components/cash-session/CloseSessionDialog";
import {
  cashSessionService,
  type ActiveCashSession,
} from "@/services/cashSession";
import {
  ChevronDown,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  Lock,
} from "lucide-react";
import { ROUTE_META } from "@/constants/navigation";
import { getInitials } from "@/utils/formatString";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSession, setActiveSession] = useState<ActiveCashSession | null>(
    () => cashSessionService.getActiveSession(),
  );
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleSync = () => {
      setActiveSession(cashSessionService.getActiveSession());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const handleCloseRegister = (actualCash: number, note?: string) => {
    try {
      cashSessionService.closeSession(actualCash, note);
      setActiveSession(null);
      setIsCloseDialogOpen(false);
      toast.success("Cash register shift closed successfully!");
    } catch {
      toast.error("Failed to close cash session");
    }
  };

  const currentMeta = ROUTE_META[location.pathname];
  const expectedDrawerCash =
    (activeSession?.openingFloat ?? 0) + (activeSession?.cashSales ?? 0);

  return (
    <header className="h-16 bg-card/70 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-foreground/80 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col text-left">
          <h1 className="text-sm sm:text-base font-extrabold text-foreground leading-tight tracking-tight">
            {currentMeta?.title || "Sela POS"}
          </h1>
          {currentMeta?.description && (
            <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">
              {currentMeta.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                  {getInitials(user?.name)}
                </div>
                {activeSession?.isOpen && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs"
                    title="Live shift active"
                  />
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-foreground leading-tight truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground capitalize">
                  {user?.role?.toLowerCase() || "Cashier"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-1.5 shadow-2xl rounded-2xl border-border/80"
          >
            <div className="hidden sm:block">
              <DropdownMenuLabel>Account Session</DropdownMenuLabel>
            </div>
            <div className="sm:hidden p-2.5 rounded-xl bg-secondary/30 border border-border/40 mb-1 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground truncate">
                    @
                    {user?.username ||
                      user?.name?.toLowerCase().replace(/\s+/g, "") ||
                      "user"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 capitalize shrink-0">
                {user?.role?.toLowerCase() || "cashier"}
              </span>
            </div>

            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </DropdownMenuItem>

            {activeSession?.isOpen && (
              <DropdownMenuItem
                onClick={() => setIsCloseDialogOpen(true)}
                className="text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-800 dark:hover:text-amber-300 font-semibold flex items-center gap-2.5"
              >
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>End Shift (Close Register)</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <div className="px-2 py-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Appearance
              </div>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-muted/60 rounded-xl border border-border/40">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    theme === "light"
                      ? "bg-card text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    theme === "dark"
                      ? "bg-card text-foreground shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Moon className="w-3.5 h-3.5 text-primary" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CloseSessionDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        expectedCash={expectedDrawerCash}
        openingFloat={activeSession?.openingFloat ?? 0}
        cashSales={activeSession?.cashSales ?? 0}
        onConfirmClose={handleCloseRegister}
      />
    </header>
  );
};

export default Navbar;
