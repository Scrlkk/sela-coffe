import React from "react";
import { User, Clock, Store, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/utils/formatCurrency";
import type { SessionHistoryItem } from "@/services/cashSession";

interface CashSessionViewProps {
  session: SessionHistoryItem;
  onSelect: (session: SessionHistoryItem) => void;
  onEdit: (session: SessionHistoryItem) => void;
}

const formatCompactTimeRange = (
  openedAt: string,
  closedAt?: string | null,
): { date: string; time: string } => {
  if (!closedAt) {
    const parts = openedAt.split(", ");
    return {
      date: parts[0] || openedAt,
      time: parts[1] ? `${parts[1]} (Live)` : "Live",
    };
  }

  const [openedDate, openedTime] = openedAt.split(", ");
  const [closedDate, closedTime] = closedAt.split(", ");

  if (openedDate && closedDate && openedDate === closedDate) {
    return {
      date: openedDate,
      time: `${openedTime || ""} – ${closedTime || ""}`,
    };
  }

  return {
    date: openedDate || openedAt,
    time: closedTime ? `→ ${closedDate} ${closedTime}` : `→ ${closedAt}`,
  };
};

export const CashSessionGridCard: React.FC<CashSessionViewProps> = ({
  session,
  onSelect,
  onEdit,
}) => {
  const isLive = session.status === "active";
  const timeRange = formatCompactTimeRange(session.openedAt, session.closedAt);

  return (
    <Card
      onClick={() => onSelect(session)}
      className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8.5 h-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono leading-tight truncate">
                  {session.id}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                  <User className="w-3 h-3 shrink-0" />
                  <span className="truncate">{session.openedBy}</span>
                  <span className="opacity-40">·</span>
                  <span className="truncate">{timeRange.date}</span>
                </div>
              </div>
            </div>

            {isLive && (
              <div className="shrink-0">
                <Badge
                  variant="secondary"
                  className="rounded-lg text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Live Shift
                </Badge>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-muted-foreground font-sans">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Float:
              </span>
              <span className="font-semibold text-foreground font-mono">
                {formatRupiah(session.openingFloat)}
              </span>
            </div>

            <div className="flex justify-between items-center font-sans">
              <span className="text-muted-foreground">Cash Sales:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatRupiah(session.cashSales)}
              </span>
            </div>

            <div className="pt-1.5 border-t border-border/40 flex justify-between items-baseline font-sans">
              <span className="text-foreground font-bold">Expected:</span>
              <span className="font-extrabold text-foreground font-mono text-sm">
                {formatRupiah(session.expectedCash)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs mt-auto">
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-medium">
              Variance
            </span>
            <span className="font-mono font-bold text-xs">
              {session.variance === null ? (
                <span className="text-muted-foreground/60">—</span>
              ) : session.variance === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Match
                </span>
              ) : session.variance > 0 ? (
                <span className="text-blue-600 dark:text-blue-400">
                  +{formatRupiah(session.variance)}
                </span>
              ) : (
                <span className="text-destructive">
                  -{formatRupiah(Math.abs(session.variance))}
                </span>
              )}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(session);
            }}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs shrink-0"
            title="Adjust / Edit Session"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Adjust</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const CashSessionTableRow: React.FC<CashSessionViewProps> = ({
  session,
  onSelect,
  onEdit,
}) => {
  const timeRange = formatCompactTimeRange(session.openedAt, session.closedAt);

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 font-bold text-foreground font-mono text-xs cursor-pointer whitespace-nowrap hidden lg:table-cell"
      >
        {session.id}
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 cursor-pointer whitespace-nowrap"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs leading-tight">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-36">{session.openedBy}</span>
          </div>
          <span className="text-[10.5px] font-mono font-bold text-primary block truncate lg:hidden mt-0.5">
            {session.id}
          </span>
        </div>
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 text-xs cursor-pointer whitespace-nowrap"
      >
        <div className="font-semibold text-foreground text-xs leading-tight">
          {timeRange.date}
        </div>
        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          {timeRange.time}
        </div>
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 text-right text-foreground font-mono text-xs cursor-pointer whitespace-nowrap hidden xl:table-cell"
      >
        {formatRupiah(session.openingFloat)}
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs cursor-pointer whitespace-nowrap hidden lg:table-cell"
      >
        +{formatRupiah(session.cashSales)}
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 text-right font-extrabold text-foreground font-mono text-xs cursor-pointer whitespace-nowrap hidden md:table-cell"
      >
        {formatRupiah(session.expectedCash)}
      </td>
      <td
        onClick={() => onSelect(session)}
        className="py-2 px-2.5 sm:px-3 text-right font-mono text-xs cursor-pointer whitespace-nowrap"
      >
        {session.variance === null ? (
          <span className="text-muted-foreground/60">—</span>
        ) : session.variance === 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            Match
          </span>
        ) : session.variance > 0 ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            +{formatRupiah(session.variance)}
          </span>
        ) : (
          <span className="text-destructive font-bold">
            -{formatRupiah(Math.abs(session.variance))}
          </span>
        )}
      </td>
      <td className="py-2 px-2.5 sm:px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(session);
            }}
            className="h-7.5 px-2 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/10 border-primary/40 cursor-pointer shadow-2xs"
            title="Adjust / Edit Session"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Adjust</span>
          </Button>
        </div>
      </td>
    </tr>
  );
};
