import React from "react";
import { User, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodFilterDropdown } from "@/components/dashboard/PeriodFilterDropdown";
import { type FilterPeriod } from "@/constants/dashboard";
import { formatRupiah } from "@/utils/formatCurrency";

export interface SessionHistoryItem {
  id: string;
  openedBy: string;
  openedAt: string;
  closedAt: string | null;
  openingFloat: number;
  cashSales: number;
  expectedCash: number;
  actualCash: number | null;
  variance: number | null;
  status: "active" | "completed";
}

interface CashSessionHistoryProps {
  history: SessionHistoryItem[];
  period: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
}

export const CashSessionHistory: React.FC<CashSessionHistoryProps> = ({
  history,
  period,
  onPeriodChange,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full xl:h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2.5 shrink-0">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            Recent Cash Sessions
          </CardTitle>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">
            Audit history of past and active register sessions
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <PeriodFilterDropdown
            value={period}
            onChange={(val) => onPeriodChange(val as FilterPeriod)}
          />
          <Badge
            variant="secondary"
            className="text-[11px] font-bold px-2.5 py-1 rounded-full border-0 bg-primary/10 text-primary hidden sm:inline-flex"
          >
            {history.length} Sessions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 min-h-0 space-y-2 pt-1 overflow-hidden">
        <div className="hidden md:block flex-1 min-h-0 max-h-95 xl:max-h-none overflow-y-auto no-scrollbar pr-0.5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                <th className="pb-2.5 px-3">Session ID</th>
                <th className="pb-2.5 px-3">Opened By</th>
                <th className="pb-2.5 px-3">Time Range</th>
                <th className="pb-2.5 px-3 text-right">Float</th>
                <th className="pb-2.5 px-3 text-right">Cash Sales</th>
                <th className="pb-2.5 px-3 text-right">Expected</th>
                <th className="pb-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-foreground">
                    {item.id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{item.openedBy}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    <div>{item.openedAt}</div>
                    {item.closedAt && (
                      <div className="text-[11px] opacity-80">
                        to {item.closedAt}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-foreground">
                    {formatRupiah(item.openingFloat)}
                  </td>
                  <td className="py-3 px-3 text-right text-foreground font-semibold">
                    {formatRupiah(item.cashSales)}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-foreground">
                    {formatRupiah(item.expectedCash)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                        <Clock className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-muted-foreground bg-muted">
                        <CheckCircle2 className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-2.5 flex-1 min-h-0 max-h-95 overflow-y-auto no-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2 text-xs transition-all hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span>{item.id}</span>
                  <span className="text-muted-foreground font-normal">·</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-28">{item.openedBy}</span>
                  </div>
                </div>
                {item.status === "active" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                    <Clock className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground bg-muted">
                    <CheckCircle2 className="w-3 h-3" />
                    Closed
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                {item.openedAt} {item.closedAt ? `→ ${item.closedAt}` : ""}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-border/40 text-center">
                <div className="bg-card p-1.5 rounded-lg border border-border/40">
                  <p className="text-[10px] text-muted-foreground">Float</p>
                  <p className="font-bold text-foreground mt-0.5">
                    {formatRupiah(item.openingFloat)}
                  </p>
                </div>
                <div className="bg-card p-1.5 rounded-lg border border-border/40">
                  <p className="text-[10px] text-muted-foreground">
                    Cash Sales
                  </p>
                  <p className="font-bold text-foreground mt-0.5">
                    {formatRupiah(item.cashSales)}
                  </p>
                </div>
                <div className="bg-card p-1.5 rounded-lg border border-border/40">
                  <p className="text-[10px] text-muted-foreground">Expected</p>
                  <p className="font-extrabold text-foreground mt-0.5">
                    {formatRupiah(item.expectedCash)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
