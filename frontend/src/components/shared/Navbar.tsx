import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/shared/NotificationDropdown";
import {
  ChevronDown,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
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

  const currentMeta = ROUTE_META[location.pathname];

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
              <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {getInitials(user?.name)}
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

          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Account Session</DropdownMenuLabel>
            <div className="sm:hidden">
              <div className="px-2 py-1 flex flex-col text-left bg-secondary/30 rounded-xl my-1 border border-border/50">
                <span className="text-xs font-bold text-foreground truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                  {user?.role?.toLowerCase() || "cashier"}
                </span>
              </div>
              <DropdownMenuSeparator />
            </div>

            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="w-4 h-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
            <div className="px-1 py-1 grid grid-cols-2 gap-1">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                  theme === "light"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                  theme === "dark"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
