import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
          >
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-6 w-28 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Synchronized Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <Card className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-4 h-80">
          <CardContent className="p-0 flex flex-col justify-between h-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>

            {/* Top Summary Stat Skeleton */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>

            {/* Simulated Chart Grid Lines Skeleton */}
            <div className="w-full flex-1 flex flex-col justify-between py-2 px-1 space-y-2">
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-40" />
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-20" />
            </div>

            {/* Bottom X-Axis Days Skeleton Pills */}
            <div className="flex items-center justify-between px-1 pt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-6 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-4 h-80">
          <CardContent className="p-0 flex flex-col justify-between items-center h-full space-y-3">
            <Skeleton className="h-5 w-32 self-start" />
            <Skeleton className="w-36 h-36 rounded-full my-auto" />
            <Skeleton className="w-full h-8 rounded-xl" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Transactions & Activities Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card
            key={idx}
            className="rounded-2xl border border-border/60 bg-card p-4 h-72"
          >
            <CardContent className="p-0 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-2xl border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
