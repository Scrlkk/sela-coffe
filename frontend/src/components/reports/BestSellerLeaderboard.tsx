import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { formatRupiah, formatNumber } from "@/utils/formatCurrency";
import type {
  BestSellerRankItem,
  CategorySalesContribution,
} from "@/services/report";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface BestSellerRankTableProps {
  items: BestSellerRankItem[];
  isLoading?: boolean;
  className?: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: { id: string; label: string }[];
}

export const BestSellerRankTable: React.FC<BestSellerRankTableProps> = ({
  items,
  isLoading = false,
  className,
  selectedCategory = "all",
  onCategoryChange,
  categoryOptions = [],
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-xs shadow-xs border border-amber-500/30">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-400/15 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-400/30">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-700/15 text-amber-700 dark:text-amber-500 font-bold text-xs border border-amber-700/30">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-muted-foreground font-semibold text-xs bg-secondary/50">
        #{rank}
      </span>
    );
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col overflow-visible",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60 relative z-20">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Top 10 Best Selling Items
          </CardTitle>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Product rankings based on total units sold for the selected period
          </p>
        </div>

        {onCategoryChange && (
          <div className="w-full sm:w-48 min-w-0">
            <FormDropdownPicker
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categoryOptions}
              icon={Filter}
              className="w-full text-xs"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-4 flex-1 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-xs">
          No sales data found for this period.
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto no-scrollbar pt-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10 text-[11px]">
                  <th className="py-2.5 sm:py-3 px-2 sm:px-2.5 w-12 text-center">Rank</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5">Product Name</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 hidden lg:table-cell">Category</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center">Units Sold</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">Total Revenue</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {items.map((item) => (
                  <tr
                    key={item.id + item.rank}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-2.5 sm:py-3 px-2 sm:px-2.5 text-center whitespace-nowrap">
                      {getRankBadge(item.rank)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground truncate max-w-48 sm:max-w-none block">
                          {item.name}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground block truncate lg:hidden mt-0.5">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 whitespace-nowrap hidden lg:table-cell text-muted-foreground font-medium">
                      {item.category}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-center font-mono whitespace-nowrap">
                      <span className="bg-secondary/70 text-foreground px-2 py-0.5 rounded-lg text-[11px] font-semibold">
                        {formatNumber(item.unitsSold)} sold
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatRupiah(item.totalRevenue)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-secondary rounded-full h-1.5 overflow-hidden hidden md:block">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{
                              width: `${Math.min(100, item.percentageContribution * 2.5)}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold text-foreground">
                          {item.percentageContribution}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden space-y-2.5 pt-2.5">
            {items.map((item) => (
              <div
                key={item.id + item.rank}
                className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getRankBadge(item.rank)}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-foreground block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                  <span className="font-mono bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {formatNumber(item.unitsSold)} sold
                  </span>
                  <span className="text-muted-foreground text-[10px] font-mono font-semibold">
                    {item.percentageContribution}% share
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Total Revenue
                  </span>
                  <span className="font-bold text-xs text-foreground font-mono">
                    {formatRupiah(item.totalRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

interface CategoryVolumeChartProps {
  data: CategorySalesContribution[];
  isLoading?: boolean;
  className?: string;
}

export const CategoryVolumeChart: React.FC<CategoryVolumeChartProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full",
        className,
      )}
    >
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
          Category Sales Volume
        </CardTitle>
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
          Comparison of sold items quantity by category
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-between min-h-65 w-full">
        {isLoading ? (
          <div className="w-full flex-1 flex flex-col justify-between py-2 space-y-3">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No category data found.
          </div>
        ) : (
          <div className="w-full h-full flex-1 min-h-65 outline-none focus:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  horizontal={false}
                  stroke="var(--foreground)"
                  strokeOpacity={0.1}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={95}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "currentColor", opacity: 0.08, rx: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CategorySalesContribution;
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl text-foreground text-xs space-y-1">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.category}</span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4">
                            <span>Units Sold:</span>
                            <span className="font-bold text-foreground font-mono">
                              {formatNumber(item.quantity)} pcs
                            </span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4">
                            <span>Total Revenue:</span>
                            <span className="font-bold text-foreground font-mono">
                              {formatRupiah(item.revenue)}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex justify-between gap-4">
                            <span>Sales Share:</span>
                            <span className="font-bold text-foreground font-mono">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="quantity"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
