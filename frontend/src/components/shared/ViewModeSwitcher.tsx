import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/hooks/useViewMode";

export type { ViewMode };

interface ViewModeSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "hidden sm:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 h-9.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "p-1.5 rounded-lg transition-all cursor-pointer",
          value === "table"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Table View"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "p-1.5 rounded-lg transition-all cursor-pointer",
          value === "grid"
            ? "bg-card text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
};
