import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { StatCard } from "@/components/dashboard/StatCard";
import { Activity } from "lucide-react";

export const ReportSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard
            key={i}
            title="Loading..."
            value="Rp 0"
            icon={Activity}
            isLoading={true}
          />
        ))}
      </StatGrid>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          <Skeleton className="h-9.5 w-full sm:w-48 rounded-xl" />
          <Skeleton className="h-9.5 w-full sm:w-52 rounded-xl" />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
          <Skeleton className="h-9.5 w-24 rounded-xl" />
          <Skeleton className="h-9.5 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 rounded-2xl border border-border/60 p-4 sm:p-5 min-h-72">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-end space-y-3 pt-4">
            <Skeleton className="h-44 w-full rounded-xl" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 rounded-2xl border border-border/60 p-4 sm:p-5 min-h-72">
          <CardHeader className="p-0 pb-4">
            <Skeleton className="h-5 w-32 rounded-md" />
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center space-y-4 pt-2">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/60 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-4">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  );
};

export default ReportSkeleton;
