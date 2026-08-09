import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { cn } from "@/lib/utils";
import { safeStorage } from "@/utils/storage";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() =>
    safeStorage.getBool("sidebar_collapsed", false),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      safeStorage.set("sidebar_collapsed", next);
      return next;
    });
  };

  return (
    <div className="h-screen max-h-screen bg-background text-foreground flex overflow-hidden">
      <div
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 ease-in-out",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
