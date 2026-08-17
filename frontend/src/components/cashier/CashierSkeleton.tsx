import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CashierSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start w-full py-1 animate-in fade-in duration-300">
      {/* Left Menu Section Skeleton */}
      <div className="flex-1 w-full space-y-4">
        {/* Search & Category Pills Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
          <div className="flex items-center gap-2 overflow-hidden pb-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-4 h-32 flex flex-col justify-between"
            >
              <CardContent className="p-0 space-y-2 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-16" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Cart Panel Skeleton */}
      <div className="w-full lg:w-96 xl:w-105 shrink-0">
        <Card className="rounded-2xl border border-border/60 bg-card p-5 h-full flex flex-col justify-between space-y-4">
          <CardContent className="p-0 space-y-4 flex flex-col h-full">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-border/60">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-11 w-full rounded-full mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

