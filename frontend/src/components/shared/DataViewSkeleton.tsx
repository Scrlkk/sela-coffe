import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DataViewSkeletonProps {
  statsCount?: number;
  columnsCount?: number;
  rowCount?: number;
  gridCount?: number;
  filterCount?: number;
  hasAddButton?: boolean;
  hasExportButton?: boolean;
  hasViewSwitcher?: boolean;
  viewMode?: "table" | "grid";
  storageKey?: string;
  className?: string;
}

export const DataViewSkeleton: React.FC<DataViewSkeletonProps> = ({
  statsCount = 4,
  columnsCount = 5,
  rowCount = 6,
  gridCount = 8,
  filterCount = 2,
  hasAddButton = true,
  hasExportButton = false,
  hasViewSwitcher = true,
  viewMode,
  storageKey,
  className,
}) => {
  const resolvedViewMode: "table" | "grid" = React.useMemo(() => {
    if (viewMode) return viewMode;
    if (typeof window !== "undefined" && storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored === "grid" || stored === "table") return stored;
      } catch {
        // ignore localStorage error
      }
    }
    return "table";
  }, [viewMode, storageKey]);

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-w-0 space-y-4 animate-in fade-in duration-300",
        className,
      )}
    >
      {statsCount > 0 && (
        <div
          className={cn(
            "grid gap-3.5 sm:gap-4",
            statsCount === 4
              ? "grid-cols-2 lg:grid-cols-4"
              : statsCount === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {Array.from({ length: statsCount }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
            >
              <CardContent className="p-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="w-7 h-7 rounded-xl" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-6 w-24 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <Skeleton className="h-9.5 w-full xl:flex-1 rounded-xl" />

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto">
          {filterCount > 0 && (
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              {Array.from({ length: filterCount }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9.5 w-full sm:w-36 md:w-40 rounded-xl"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2.5 shrink-0">
            {hasViewSwitcher && <Skeleton className="h-9.5 w-20 rounded-xl" />}
            {hasExportButton && (
              <Skeleton className="h-9.5 w-9.5 rounded-xl hidden sm:block" />
            )}
            {hasAddButton && (
              <Skeleton className="h-9.5 w-28 sm:w-36 rounded-xl" />
            )}
          </div>
        </div>
      </div>

      {resolvedViewMode === "table" ? (
        <div className="space-y-4 pb-6">
          <div className="hidden sm:block">
            <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs w-full overflow-hidden">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-border/60">
                  {Array.from({ length: columnsCount }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className={cn(
                        "h-3.5",
                        i === 0
                          ? "w-36"
                          : i === columnsCount - 1
                            ? "w-16"
                            : i === 1
                              ? "w-28"
                              : "w-20",
                      )}
                    />
                  ))}
                </div>

                {Array.from({ length: rowCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-36">
                      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>

                    {Array.from({ length: Math.max(1, columnsCount - 2) }).map(
                      (_, j) => (
                        <Skeleton key={j} className="h-3.5 w-20" />
                      ),
                    )}

                    <div className="flex items-center gap-1.5 min-w-16 justify-end">
                      <Skeleton className="w-7 h-7 rounded-lg" />
                      <Skeleton className="w-7 h-7 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="block sm:hidden space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 pb-6">
          {Array.from({ length: gridCount }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-lg shrink-0" />
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto text-xs gap-1">
                <div className="space-y-0.5">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="h-7.5 w-7.5 rounded-lg" />
                  <Skeleton className="h-7.5 w-16 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataViewSkeleton;
