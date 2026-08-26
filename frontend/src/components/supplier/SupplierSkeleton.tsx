import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { safeStorage } from "@/utils/storage";

interface SupplierSkeletonProps {
  viewMode?: "grid" | "table";
}

export const SupplierSkeleton: React.FC<SupplierSkeletonProps> = ({
  viewMode: propViewMode,
}) => {
  const [viewMode] = useState<"grid" | "table">(() => {
    if (propViewMode) return propViewMode;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "grid";
    }
    const saved = safeStorage.getItem("sela_supplier_view_mode");
    return saved === "grid" || saved === "table" ? saved : "table";
  });

  const activeView = propViewMode || viewMode;

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4 animate-in fade-in duration-300 select-none">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
          >
            <CardContent className="p-0 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs">
        <Skeleton className="h-9.5 w-full xl:flex-1 rounded-xl" />

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full xl:w-auto min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9.5 w-18 rounded-xl" />
            <Skeleton className="h-9.5 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-9.5 w-32 rounded-xl shrink-0" />
        </div>
      </div>

      {activeView === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 pb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border border-border/60 shadow-2xs rounded-2xl bg-card overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                  <div className="flex items-center gap-1.5 pl-6">
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-md" />
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-md" />
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                  </div>
                  <div className="flex items-start gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-md mt-0.5" />
                    <Skeleton className="h-3.5 w-full rounded-md" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="pb-6">
          <div className="hidden sm:block">
            <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs w-full overflow-hidden mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md hidden lg:block" />
                  <Skeleton className="h-4 w-32 rounded-md hidden xl:block" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>

                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-border/30"
                  >
                    <div className="flex items-center gap-2 w-36">
                      <Skeleton className="w-4 h-4 rounded-md" />
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </div>
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-3.5 w-24 rounded-md hidden lg:block" />
                    <Skeleton className="h-3.5 w-32 rounded-md hidden xl:block" />
                    <div className="flex gap-1">
                      <Skeleton className="w-7 h-7 rounded-lg" />
                      <Skeleton className="w-7 h-7 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-4 space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                  <Skeleton className="h-3.5 w-full rounded-md" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40 gap-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSkeleton;
