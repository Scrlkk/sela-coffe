import { useState } from "react";

export type ViewMode = "grid" | "table";

export function useViewMode(
  storageKey: string,
  fallbackMode: ViewMode = "table",
) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      if (typeof window === "undefined") return fallbackMode;
      const saved = localStorage.getItem(storageKey);
      if (saved === "grid" || saved === "table") {
        return saved;
      }
      return fallbackMode;
    } catch {
      return fallbackMode;
    }
  });

  const [userSwitchedView, setUserSwitchedView] = useState(false);

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      setUserSwitchedView(true);
      setViewMode(mode);
    }
    try {
      localStorage.setItem(storageKey, mode);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    viewMode,
    userSwitchedView,
    handleViewModeChange,
  };
}

export default useViewMode;
