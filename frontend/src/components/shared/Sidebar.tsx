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

  return (
    <aside
      className={cn(
        "h-screen max-h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out flex flex-col z-50 shrink-0 select-none border-r border-sidebar-border fixed inset-y-0 left-0 md:static",
        mobileOpen
          ? "translate-x-0 shadow-2xl"
          : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-16" : "w-64",
      )}
    >
      {/* Sidebar Header Brand */}
      <div className="h-16 px-3 flex flex-col justify-center">
        <div
          className={cn(
            "h-full flex items-center border-b border-sidebar-border/60",
            collapsed && !mobileOpen
              ? "justify-center px-1"
              : "justify-between px-2",
          )}
        >
          {collapsed && !mobileOpen ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="group relative w-12 h-12 flex items-center justify-center shrink-0 transition-all cursor-pointer"
            >
              <SelaLogo className="h-8 w-auto group-hover:hidden shrink-0" />
              <ChevronRight className="w-5 h-5 text-sidebar-foreground hidden group-hover:block transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <SelaLogo className="h-8 w-auto shrink-0" />
                <span className="font-extrabold text-lg text-sidebar-foreground tracking-tight whitespace-nowrap">
                  Workspace
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Mobile Close Button */}
                {onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    title="Close Sidebar"
                    className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Desktop Collapse Button */}
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

      {/* Sidebar Navigation Items */}
      <div
        className={cn(
          "flex-1 overflow-y-auto no-scrollbar pt-4 pb-12 space-y-6",
          collapsed && !mobileOpen ? "px-2" : "px-3",
        )}
      >
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {(!collapsed || mobileOpen) && (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-sidebar-foreground/60 uppercase mb-2">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer",
                    collapsed && !mobileOpen ? "justify-center px-0" : "px-3",
                    isActive
                      ? "bg-card text-foreground shadow-lg shadow-black/10 font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-primary/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {(!collapsed || mobileOpen) && (
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
