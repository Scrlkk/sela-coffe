import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { safeStorage } from "@/utils/storage";

export const CategorySkeleton: React.FC = () => {
  const [viewMode] = useState<"grid" | "table">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "grid";
    }
    const saved = safeStorage.getItem("sela_category_view_mode");
    return saved === "table" || saved === "grid" ? saved : "grid";
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
          >
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-24 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <Skeleton className="h-10 w-full sm:flex-1 rounded-xl" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>

      {viewMode === "table" ? (
        <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs w-full overflow-hidden mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border/30"
              >
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3.5 w-48 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex gap-1">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1 pb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-3.5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-1/2 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <div className="flex justify-between items-center pt-3 border-t border-border/40">
                <Skeleton className="h-3.5 w-24" />
                <div className="flex gap-1">
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

export default CategorySkeleton;
