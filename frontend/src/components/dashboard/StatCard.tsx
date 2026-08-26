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
          "rounded-xl border border-border/60 bg-card p-3 sm:p-3.5 md:p-4 shadow-sm select-none",
          className,
        )}
      >
        <CardContent className="p-0 space-y-2.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
              <Skeleton className="h-3.5 w-16 sm:w-20" />
            </div>
            <Skeleton className="h-3.5 w-10 rounded-full" />
          </div>
          <Skeleton className="h-5 sm:h-6 w-24 sm:w-28 mt-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "rounded-xl border border-border/60 bg-card p-3 sm:p-3.5 md:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md select-none",
        className,
      )}
    >
      <CardContent className="p-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <p className="text-[11px] sm:text-xs md:text-xs text-muted-foreground font-medium truncate">
              {title}
            </p>
          </div>

          {badgeText && (
            <>
              
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full sm:hidden shrink-0 ml-1",
                  badgeVariant === "danger"
                    ? "bg-destructive"
                    : badgeVariant === "neutral"
                      ? "bg-muted-foreground/50"
                      : "bg-emerald-500",
                )}
                title={badgeText}
              />

              <span
                className={cn(
                  "hidden sm:inline-flex text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 items-center gap-0.5 whitespace-nowrap",
                  badgeVariant === "danger"
                    ? "text-destructive bg-destructive/10"
                    : badgeVariant === "neutral"
                      ? "text-muted-foreground bg-muted border border-border/50"
                      : "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
                )}
              >
                {badgeText}
              </span>
            </>
          )}
        </div>

        <div className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground truncate pt-0.5">
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
