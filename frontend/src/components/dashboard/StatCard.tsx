import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string;
  badgeText?: string;
  badgeVariant?: "success" | "danger" | "neutral";
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  badgeText,
  badgeVariant = "success",
  icon: Icon,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <Card
        className={cn(
          "rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-sm select-none",
          className,
        )}
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
    );
  }

  return (
    <Card
      className={cn(
        "rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md select-none",
        className,
      )}
    >
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">
              {title}
            </p>
          </div>

          {badgeText && (
            <span
              className={cn(
                "text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5 whitespace-nowrap",
                badgeVariant === "danger"
                  ? "text-destructive bg-destructive/10"
                  : badgeVariant === "neutral"
                    ? "text-muted-foreground bg-muted border border-border/50"
                    : "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
              )}
            >
              {badgeText}
            </span>
          )}
        </div>

        <div className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate pt-0.5">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
