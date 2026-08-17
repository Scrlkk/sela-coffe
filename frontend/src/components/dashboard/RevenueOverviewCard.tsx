import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilterDropdown } from "@/components/dashboard/PeriodFilterDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCw } from "lucide-react";
import { formatRupiah } from "@/utils/formatCurrency";
import {
  REVENUE_OVERVIEW_DATA,
  type RevenuePoint,
} from "@/constants/dashboard";
import { cn } from "@/lib/utils";

interface RevenueOverviewCardProps {
  data?: RevenuePoint[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const RevenueOverviewCard: React.FC<RevenueOverviewCardProps> = ({
  data = REVENUE_OVERVIEW_DATA,
  period = "This Week",
  onPeriodChange,
  onRefresh,
  isLoading = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md select-none flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Revenue Overview
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            {period}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh revenue"
            >
              <RotateCw
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isLoading && "animate-spin text-primary",
                )}
              />
            </button>
          )}

          {onPeriodChange && (
            <PeriodFilterDropdown value={period} onChange={onPeriodChange} />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 relative flex-1 flex flex-col justify-between mt-1 w-full min-h-44 sm:min-h-48">
        {isLoading ? (
          <div className="w-full h-full min-h-44 sm:min-h-48 flex flex-col justify-between space-y-3 pt-1">
            <div className="flex items-center justify-between pt-0.5">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>

            <div className="w-full flex-1 flex flex-col justify-between py-2 px-1 space-y-2">
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-40" />
              <Skeleton className="w-full h-0.5 opacity-30" />
              <Skeleton className="w-full h-0.5 opacity-20" />
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-6 rounded-md" />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex-1 min-h-44 sm:min-h-48 outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--foreground)"
                  strokeOpacity={0.12}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  dy={6}
                />

                <YAxis
                  width={78}
                  tickCount={5}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickFormatter={(val: number) => formatRupiah(val, true)}
                  domain={[
                    0,
                    (dataMax: number) => Math.ceil((dataMax || 100) * 1.15),
                  ]}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as RevenuePoint;
                      const formatted = formatRupiah(item.revenue);
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-2.5 py-1 shadow-lg text-foreground text-[11px] space-y-0.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold text-foreground">
                            {item.day}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            revenue:{" "}
                            <span className="font-semibold text-foreground">
                              {formatted}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--foreground)"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                  animationDuration={1000}
                  dot={{
                    r: 3.5,
                    fill: "var(--foreground)",
                    stroke: "var(--card)",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5.5,
                    fill: "var(--foreground)",
                    stroke: "var(--card)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueOverviewCard;
