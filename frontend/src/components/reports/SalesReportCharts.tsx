import React, { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import type { RevenueTrendPoint, PaymentMethodBreakdown } from "@/services/report";
import { cn } from "@/lib/utils";
import { CreditCard, QrCode, Banknote } from "lucide-react";

interface SalesRevenueTrendCardProps {
  data: RevenueTrendPoint[];
  periodLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export const SalesRevenueTrendCard: React.FC<SalesRevenueTrendCardProps> = ({
  data,
  periodLabel = "Selected Period",
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
            {periodLabel}
          </p>
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
                  <linearGradient id="salesReportRevGrad" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="label"
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
                      const item = payload[0].payload as RevenueTrendPoint;
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-2.5 py-1.5 shadow-lg text-foreground text-[11px] space-y-0.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold text-foreground">
                            {item.label} ({item.dateKey})
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium flex justify-between gap-3">
                            <span>Revenue:</span>
                            <span className="font-semibold text-foreground font-mono">
                              {formatRupiah(item.revenue)}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium flex justify-between gap-3">
                            <span>Orders:</span>
                            <span className="font-semibold text-foreground font-mono">
                              {item.ordersCount} trx
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
                  fill="url(#salesReportRevGrad)"
                  isAnimationActive={false}
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

interface PaymentMethodDistributionCardProps {
  data: PaymentMethodBreakdown[];
  periodLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export const PaymentMethodDistributionCard: React.FC<
  PaymentMethodDistributionCardProps
> = ({ data, periodLabel = "Selected Period", isLoading = false, className }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = data.map((item) => ({
    name: item.method,
    value: item.percentage,
    fill: item.color,
  }));

  const activeSlice = hoveredIdx !== null ? data[hoveredIdx] : null;

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "qris":
        return <QrCode className="w-3.5 h-3.5" />;
      case "card":
        return <CreditCard className="w-3.5 h-3.5" />;
      default:
        return <Banknote className="w-3.5 h-3.5" />;
    }
  };

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
            Payment Methods
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            {periodLabel}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col sm:flex-row lg:flex-col items-center justify-center sm:justify-between lg:justify-between gap-3 sm:gap-6 lg:gap-2 my-auto w-full">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="w-full space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No transaction data for this period.
          </div>
        ) : (
          <>
            <div
              className="relative w-40 sm:w-44 lg:w-full h-40 sm:h-40 lg:h-36 flex items-center justify-center shrink-0 my-0.5 outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-sector]:outline-none"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={44}
                    outerRadius={66}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`pay-cell-${index}`}
                        fill={entry.fill}
                        stroke="transparent"
                        style={{
                          outline: "none",
                          cursor: "pointer",
                          filter:
                            hoveredIdx === index
                              ? "brightness(1.1) drop-shadow(0px 2.5px 6px rgba(0,0,0,0.16))"
                              : hoveredIdx !== null
                                ? "opacity(0.65)"
                                : "none",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                {activeSlice ? (
                  <div className="animate-in fade-in zoom-in-90 duration-150">
                    <span className="block text-[10px] sm:text-xs text-muted-foreground font-medium truncate max-w-22.5">
                      {activeSlice.label}
                    </span>
                    <span className="block text-xs sm:text-sm font-extrabold text-foreground">
                      {activeSlice.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-150 opacity-60">
                    <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                      Total
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-foreground">
                      100%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="w-full max-w-xs sm:max-w-none lg:w-full max-h-32 overflow-y-auto no-scrollbar space-y-1"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {data.map((item, idx) => {
                const isActive = hoveredIdx === idx;
                return (
                  <div
                    key={item.method}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    className={cn(
                      "flex items-center justify-between text-[11px] sm:text-xs font-medium cursor-pointer py-1 px-2 rounded-lg transition-all w-full",
                      isActive
                        ? "bg-secondary/65 font-bold text-foreground"
                        : "hover:bg-secondary/30 text-foreground/80",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform"
                        style={{
                          backgroundColor: item.color,
                          transform: isActive ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                      <div className="flex items-center gap-1.5 text-foreground/90 font-medium truncate">
                        {getMethodIcon(item.method)}
                        <span className="truncate">{item.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono shrink-0 ml-auto pl-2 whitespace-nowrap">
                      <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                        ({formatNumber(item.count)} trx)
                      </span>
                      <span className="font-semibold text-foreground min-w-7 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
