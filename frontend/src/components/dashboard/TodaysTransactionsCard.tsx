import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ChevronRight, RotateCw } from "lucide-react";
import {
  TODAY_TRANSACTIONS_DATA,
  type DashboardTransactionItem,
} from "@/constants/dashboard";
import { cn } from "@/lib/utils";

interface TodaysTransactionsCardProps {
  data?: DashboardTransactionItem[];
  isLoading?: boolean;
  className?: string;
  onViewAll?: () => void;
  onRefresh?: () => void;
}

export const TodaysTransactionsCard: React.FC<TodaysTransactionsCardProps> = ({
  data = TODAY_TRANSACTIONS_DATA,
  isLoading = false,
  className,
  onViewAll,
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
          Today's Transactions
        </CardTitle>

        <div className="flex items-center gap-1.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh transactions"
            >
              <RotateCw
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isLoading && "animate-spin text-primary",
                )}
              />
            </button>
          )}

          <button
            onClick={onViewAll}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer ml-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 my-auto w-full">
        <div className="flex-1 max-h-72 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex flex-col items-end">
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                </div>
              ))
            : data.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-secondary/35 hover:bg-secondary/65 border border-border/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {item.code}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                        {item.time} · {item.itemsCount}{" "}
                        {item.itemsCount === 1 ? "item" : "items"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {item.formattedAmount}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-1",
                        item.status === "completed" &&
                          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                        item.status === "refunded" &&
                          "bg-destructive/10 text-destructive",
                        item.status === "pending" &&
                          "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysTransactionsCard;
