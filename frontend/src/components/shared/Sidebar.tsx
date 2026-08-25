import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { menuGroups } from "@/constants/navigation";
import { SelaLogo } from "@/components/shared/SelaLogo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const isCollapsed = collapsed && !mobileOpen;

  return (
    <aside
      className={cn(
        "h-screen max-h-screen bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300 ease-in-out flex flex-col z-50 shrink-0 select-none border-r border-sidebar-border fixed inset-y-0 left-0 md:static overflow-hidden",
        mobileOpen
          ? "translate-x-0 shadow-2xl w-64"
          : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <div className="h-16 px-3 flex flex-col justify-center shrink-0">
        <div
          className={cn(
            "h-full flex items-center border-b border-sidebar-border/60",
            isCollapsed ? "justify-center px-1" : "justify-between px-2",
          )}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="group relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all hover:bg-sidebar-primary/50 cursor-pointer text-sidebar-foreground"
            >
              <SelaLogo className="h-7 w-auto group-hover:hidden shrink-0" />
              <ChevronRight className="w-5 h-5 text-sidebar-foreground hidden group-hover:block transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                <SelaLogo className="h-8 w-auto shrink-0" />
                <span className="font-extrabold text-lg text-sidebar-foreground tracking-tight whitespace-nowrap truncate">
                  Workspace
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    title="Close Sidebar"
                    className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onToggleCollapse}
                  title="Collapse Sidebar"
                  className="hidden md:block text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto no-scrollbar pt-4 pb-12 space-y-6",
          isCollapsed ? "px-2" : "px-3",
        )}
      >
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-sidebar-foreground/60 uppercase mb-2">
                {group.label}
              </h3>
            ) : idx > 0 ? (
              <div className="my-2 mx-auto w-6 border-t border-sidebar-border/40" />
            ) : null}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer",
                    isCollapsed ? "justify-center px-0" : "px-3",
                    isActive
                      ? "bg-card text-foreground shadow-lg shadow-black/10 font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-primary/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};
