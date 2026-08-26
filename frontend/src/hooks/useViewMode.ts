import { useState } from "react";
import { safeStorage } from "@/utils/storage";

export type ViewMode = "grid" | "table";

export function useViewMode(
  storageKey: string,
  fallbackMode: ViewMode = "table",
) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return fallbackMode;
    const saved = safeStorage.getItem(storageKey);
    if (saved === "grid" || saved === "table") {
      return saved;
    }
    return fallbackMode;
  });

  const [userSwitchedView, setUserSwitchedView] = useState(false);

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode !== viewMode) {
      setUserSwitchedView(true);
      setViewMode(mode);
    }
    safeStorage.setItem(storageKey, mode);
  };

  return {
    viewMode,
    userSwitchedView,
    handleViewModeChange,
  };
}

export default useViewMode;
