import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StockSkeleton: React.FC = () => {
  const [viewMode] = useState<"grid" | "table">(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        return "grid";
      }
      const saved = localStorage.getItem("sela_stock_view_mode");
      return saved === "grid" || saved === "table" ? saved : "grid";
    } catch {
      return "grid";
    }
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4 animate-in fade-in duration-300">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
          >
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-28 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs">
        <Skeleton className="h-9.5 w-full rounded-xl" />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9.5 w-36 rounded-xl" />
            <Skeleton className="h-9.5 w-44 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9.5 w-20 rounded-xl" />
            <Skeleton className="h-9.5 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* View Skeleton */}
      {viewMode === "table" ? (
        <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs w-full overflow-hidden mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-border/30"
              >
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <div className="flex gap-1.5">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1 pb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-4 space-y-3.5"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSkeleton;
