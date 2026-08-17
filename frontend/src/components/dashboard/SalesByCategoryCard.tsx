import React, { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SALES_BY_CATEGORY_DATA,
  type CategorySale,
} from "@/constants/dashboard";
import { cn } from "@/lib/utils";

interface SalesByCategoryCardProps {
  data?: CategorySale[];
  period?: string;
  isLoading?: boolean;
  className?: string;
}

export const SalesByCategoryCard: React.FC<SalesByCategoryCardProps> = ({
  data = SALES_BY_CATEGORY_DATA,
  period = "This Week",
  isLoading = false,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.percentage,
    fill: item.color,
  }));

  const activeSlice = hoveredIdx !== null ? data[hoveredIdx] : null;

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
            Sales by Category
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            {period}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-row lg:flex-col items-center justify-center lg:justify-between gap-6 sm:gap-8 lg:gap-2.5 my-auto w-full">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="w-full space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div
              className="relative w-40 sm:w-48 lg:w-full h-40 sm:h-44 lg:h-36 flex items-center justify-center shrink-0 my-0.5 outline-none focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-sector]:outline-none"
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
                    isAnimationActive
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
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
                      {activeSlice.category}
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
              className="flex-1 max-w-xs lg:w-full max-h-28 overflow-y-auto no-scrollbar space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out fill-mode-backwards"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {data.map((item, idx) => {
                const isActive = hoveredIdx === idx;
                return (
                  <div
                    key={item.category}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    className={cn(
                      "flex items-center justify-between text-[11px] sm:text-xs font-medium cursor-pointer py-0.5 px-1.5 rounded-md transition-all",
                      isActive
                        ? "bg-secondary/65 font-bold text-foreground"
                        : "hover:bg-secondary/30 text-foreground/80",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 transition-transform"
                        style={{
                          backgroundColor: item.color,
                          transform: isActive ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                      <span className="text-foreground/90">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {item.percentage}%
                    </span>
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

export default SalesByCategoryCard;
