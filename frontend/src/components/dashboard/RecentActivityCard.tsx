import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCw } from "lucide-react";
import {
  RECENT_ACTIVITIES_DATA,
  type ActivityItem,
} from "@/constants/dashboard";
import { cn } from "@/lib/utils";

interface RecentActivityCardProps {
  data?: ActivityItem[];
  isLoading?: boolean;
  className?: string;
  onRefresh?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  data = RECENT_ACTIVITIES_DATA,
  isLoading = false,
  className,
  onRefresh,
}) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md select-none flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
          Recent Activity
        </CardTitle>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh activities"
          >
            <RotateCw
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                isLoading && "animate-spin text-primary",
              )}
            />
          </button>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 my-auto w-full">
        <div className="flex-1 max-h-72 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-border/40"
                >
                  <Skeleton className="w-1.5 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-5/6" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            : data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl bg-secondary/35 hover:bg-secondary/65 border border-border/40 transition-all cursor-pointer group"
                >
                  <span
                    className="w-1.5 rounded-full self-stretch shrink-0 min-h-9 transition-transform group-hover:scale-y-105"
                    style={{ backgroundColor: item.accentColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-snug">
                      {item.message}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-1">
                      {item.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
