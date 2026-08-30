import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border border-border/60 bg-card p-3 sm:p-3.5 md:p-4 shadow-sm select-none"
          >
            <CardContent className="p-0 space-y-2.5">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
                  <Skeleton className="h-3.5 w-16 sm:w-20" />
                </div>
                <Skeleton className="hidden sm:block h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-28 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        <Card className="lg:col-span-3 rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-90 max-h-96">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton className="h-4 sm:h-5 w-36" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col justify-between pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            <div className="w-full flex-1 flex flex-col justify-between py-2 px-1 space-y-3 min-h-35">
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-40" />
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-20" />
            </div>

            <div className="flex items-center justify-between px-2 pt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-6 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-90 max-h-96">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton className="h-4 sm:h-5 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col items-center justify-center gap-3 py-2 my-auto w-full">
            <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full my-auto" />
            <div className="w-full space-y-2 pt-1">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <Card className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-85 max-h-96">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 sm:h-5 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 space-y-2.5 my-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-3.5 w-24 sm:w-28" />
                    <Skeleton className="h-3 w-32 sm:w-40" />
                  </div>
                </div>
                <div className="space-y-1 text-right shrink-0">
                  <Skeleton className="h-3.5 w-16 sm:w-20 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-85 max-h-96">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 sm:h-5 w-32" />
            <Skeleton className="h-6 w-6 rounded-lg" />
          </CardHeader>

          <CardContent className="p-0 flex-1 space-y-2 my-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20"
              >
                <Skeleton className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
                <div className="flex-1 space-y-1 min-w-0">
                  <Skeleton className="h-3.5 w-32 sm:w-36" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
