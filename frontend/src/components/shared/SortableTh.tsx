import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortConfig } from "@/hooks/useTableSort";

interface SortableThProps {
  label: string;
  sortKey: string;
  sortConfig?: SortConfig | null;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
}

export const SortableTh: React.FC<SortableThProps> = ({
  label,
  sortKey,
  sortConfig,
  onSort,
  className,
  align = "left",
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const isAsc = isSorted && sortConfig?.direction === "asc";

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cn(
        "py-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1 leading-none",
          align === "right" && "justify-end",
          align === "center" && "justify-center",
        )}
      >
        <span>{label}</span>
        {isSorted ? (
          isAsc ? (
            <ArrowUp className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-primary shrink-0" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
        )}
      </div>
    </th>
  );
};

export default SortableTh;
