import React from "react";
import {
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  itemLabel = "items",
}) => {
  const pageNumbers = React.useMemo<(number | "...")[]>(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 w-full text-xs select-none",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-muted-foreground font-medium order-2 sm:order-1 w-full sm:w-auto">
        <span className="text-[11px] sm:text-[11.5px] whitespace-nowrap">
          Showing{" "}
          <strong className="text-foreground font-bold font-mono">
            {startItem}–{endItem}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground font-bold font-mono">
            {totalItems}
          </strong>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted border border-border/80 rounded-xl px-2 py-0.5 text-[11px] font-bold text-foreground cursor-pointer transition-colors shadow-2xs">
                <span>{pageSize} / page</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-28 p-1 rounded-xl shadow-xl border-border/90 bg-popover/98 backdrop-blur-md"
              >
                {pageSizeOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt}
                    onClick={() => onPageSizeChange(opt)}
                    className={cn(
                      "flex items-center justify-between text-xs py-1.5 px-2 rounded-lg font-medium",
                      pageSize === opt &&
                        "bg-primary/10 text-primary font-bold",
                    )}
                  >
                    <span>{opt} / page</span>
                    {pageSize === opt && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <nav
        role="navigation"
        aria-label="pagination"
        className="mx-0 w-auto order-1 sm:order-2"
      >
        <div className="bg-muted/40 p-1 rounded-xl border border-border/60 shadow-2xs gap-0.5 flex items-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Go to previous page"
            className={cn(
              "h-7 px-2 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-card inline-flex items-center gap-1 cursor-pointer transition-colors",
              currentPage === 1 && "opacity-30 pointer-events-none",
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {pageNumbers.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  aria-hidden
                  className="flex h-7 w-5 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-7 min-w-7 px-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center",
                  isCurrent
                    ? "bg-card text-foreground shadow-2xs border border-border/80 font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card",
                )}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Go to next page"
            className={cn(
              "h-7 px-2 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-card inline-flex items-center gap-1 cursor-pointer transition-colors",
              (currentPage === totalPages || totalPages === 0) &&
                "opacity-30 pointer-events-none",
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Pagination;

