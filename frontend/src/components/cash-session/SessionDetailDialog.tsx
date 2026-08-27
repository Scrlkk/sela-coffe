import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  User,
  Clock,
  CheckCircle2,
  FileText,
  Banknote,
  QrCode,
  CreditCard,
} from "lucide-react";
import { formatRupiah } from "@/utils/formatCurrency";
import type { SessionHistoryItem } from "@/services/cashSession";

interface SessionDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionHistoryItem | null;
}

export const SessionDetailDialog: React.FC<SessionDetailDialogProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!session) return null;

  const isLive = session.status === "active";
  const cardSales = session.cardSales ?? 0;
  const qrSales = session.qrSales ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="space-y-0.5 min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground font-mono">
                Session #{session.id}
              </DialogTitle>
              {isLive ? (
                <Badge
                  variant="secondary"
                  className="rounded-lg text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Live Shift
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-lg text-[10px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border border-border/60 gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Closed
                </Badge>
              )}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Register session breakdown and audit details.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-1 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Opened By:</span>
              </span>
              <span className="font-semibold text-foreground">
                {session.openedBy}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Started:</span>
              </span>
              <span className="font-medium text-foreground">
                {session.openedAt}
              </span>
            </div>
            {session.closedAt && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Closed:</span>
                </span>
                <span className="font-medium text-foreground">
                  {session.closedAt}
                </span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5 font-mono">
            <div className="flex justify-between items-center text-muted-foreground font-sans">
              <span>Opening Float:</span>
              <span className="font-semibold text-foreground font-mono">
                {formatRupiah(session.openingFloat)}
              </span>
            </div>

            <div className="flex justify-between items-center font-sans">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Cash Sales:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatRupiah(session.cashSales)}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground font-sans">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-primary" />
                <span>QRIS Sales:</span>
              </span>
              <span className="font-medium text-foreground font-mono">
                {formatRupiah(qrSales)}
              </span>
            </div>

            <div className="flex justify-between items-center text-muted-foreground font-sans">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Card Sales:</span>
              </span>
              <span className="font-medium text-foreground font-mono">
                {formatRupiah(cardSales)}
              </span>
            </div>

            <div className="pt-2 border-t border-border/50 flex justify-between items-baseline font-sans">
              <span className="text-foreground font-bold">
                Expected Cash in Drawer:
              </span>
              <span className="font-extrabold text-base text-foreground font-mono">
                {formatRupiah(session.expectedCash)}
              </span>
            </div>

            {session.actualCash !== null && (
              <div className="flex justify-between items-baseline font-sans">
                <span className="text-foreground font-bold">
                  Actual Cash Counted:
                </span>
                <span className="font-extrabold text-base text-foreground font-mono">
                  {formatRupiah(session.actualCash)}
                </span>
              </div>
            )}

            {session.variance !== null && (
              <div className="pt-1.5 border-t border-border/40 flex justify-between items-center font-sans">
                <span className="font-semibold text-muted-foreground">
                  Variance:
                </span>
                <span className="font-mono font-bold">
                  {session.variance === 0 ? (
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
            )}
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Session Notes</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed font-medium">
              {session.note ? (
                session.note
              ) : (
                <span className="text-muted-foreground italic">
                  No closing notes provided
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
