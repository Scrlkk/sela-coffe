import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CashSessionSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full py-1 animate-in fade-in duration-300">
      {/* Top 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs"
          >
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
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

      {/* Main Responsive Layout Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column Register Card Skeleton */}
        <div className="xl:col-span-4 w-full h-full">
          <Card className="border border-border/60 shadow-xs rounded-2xl bg-card p-6 sm:p-8 h-full flex flex-col justify-between">
            <CardContent className="p-0 flex flex-col items-center text-center space-y-4 my-auto">
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-4 w-64 rounded-md" />
              <div className="w-full space-y-2 pt-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-11 w-full rounded-full mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column History Table Skeleton */}
        <div className="xl:col-span-8 w-full h-full">
          <Card className="border border-border/60 shadow-xs rounded-2xl bg-card p-5 h-full flex flex-col justify-between">
            <CardContent className="p-0 space-y-4 flex flex-col h-full">
              <div className="flex justify-between items-center pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                </div>
                <Skeleton className="h-6 w-28 rounded-xl" />
              </div>
              <div className="space-y-3 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CashSessionSkeleton;
