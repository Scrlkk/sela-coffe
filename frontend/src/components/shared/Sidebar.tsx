import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Coffee, ChevronLeft, ChevronRight } from "lucide-react";
import { menuGroups } from "@/utils/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <aside
      className={`h-screen max-h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col z-30 shrink-0 select-none border-r border-sidebar-border ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header Brand */}
      <div className="h-16 px-3 flex flex-col justify-center">
        <div
          className={`h-full flex items-center border-b border-sidebar-border/60 ${
            collapsed ? "justify-center px-1" : "justify-between px-2"
          }`}
        >
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className="group relative w-10 h-10 rounded-full bg-sidebar-primary hover:bg-sidebar-primary/80 flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer"
            >
              <Coffee className="w-5 h-5 text-sidebar-foreground group-hover:hidden transition-transform" />
              <ChevronRight className="w-5 h-5 text-sidebar-foreground hidden group-hover:block transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0 shadow-md">
                  <Coffee className="w-5 h-5 text-sidebar-foreground" />
                </div>
                <span className="font-extrabold text-lg text-sidebar-foreground tracking-tight whitespace-nowrap">
                  Sela POS
                </span>
              </div>

              <button
                onClick={onToggleCollapse}
                title="Collapse Sidebar"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Navigation Items */}
      <div
        className={`flex-1 overflow-y-auto no-scrollbar py-4 space-y-6 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
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
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-card text-foreground shadow-lg shadow-black/10 font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-primary/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};
