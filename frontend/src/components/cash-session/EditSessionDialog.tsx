import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlidersHorizontal, CheckCircle2, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import type { SessionHistoryItem } from "@/services/cashSession";

interface EditSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionHistoryItem | null;
  onSave: (sessionId: string, updates: Partial<SessionHistoryItem>) => void;
}

interface EditSessionFormProps {
  session: SessionHistoryItem;
  onClose: () => void;
  onSave: (sessionId: string, updates: Partial<SessionHistoryItem>) => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({
  session,
  onClose,
  onSave,
}) => {
  const [openingFloat, setOpeningFloat] = useState<string>(
    session.openingFloat.toString(),
  );
  const [actualCash, setActualCash] = useState<string>(
    session.actualCash !== null ? session.actualCash.toString() : "",
  );
  const [note, setNote] = useState<string>(session.note ?? "");
  const [openedBy, setOpenedBy] = useState<string>(session.openedBy ?? "");

  const isLive = session.status === "active";
  const numOpeningFloat = Number(openingFloat) || 0;
  const numActualCash = actualCash !== "" ? Number(actualCash) : null;
  const expectedCash = numOpeningFloat + session.cashSales;
  const variance =
    numActualCash !== null ? numActualCash - expectedCash : null;

  const isMatched = variance === 0;
  const isOver = variance !== null && variance > 0;
  const isShort = variance !== null && variance < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(session.id, {
      openedBy: openedBy.trim() || session.openedBy,
      openingFloat: numOpeningFloat,
      actualCash: numActualCash,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 py-1">
      <div className="space-y-1.5">
        <Label
          htmlFor="edit-opened-by"
          className="text-xs font-semibold text-foreground"
        >
          Cashier Name (Petugas Kasir)
        </Label>
        <Input
          id="edit-opened-by"
          type="text"
          value={openedBy}
          onChange={(e) => setOpenedBy(e.target.value)}
          placeholder="e.g. Kasir (kasir)"
          className="h-10 rounded-xl bg-background border-border/80 text-foreground text-xs sm:text-sm font-semibold focus-visible:ring-primary shadow-2xs w-full"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="edit-opening-float"
          className="text-xs font-semibold text-foreground"
        >
          Opening Cash Float (Modal Awal Rp)
        </Label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-muted-foreground font-semibold text-xs select-none">
            Rp
          </span>
          <Input
            id="edit-opening-float"
            type="number"
            min="0"
            value={openingFloat}
            onChange={(e) => setOpeningFloat(e.target.value)}
            placeholder="200000"
            className="h-10 pl-10 rounded-xl bg-background border-border/80 text-foreground text-sm font-mono font-bold focus-visible:ring-primary shadow-2xs w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            required
          />
        </div>
      </div>

      {!isLive && (
        <>
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-actual-cash"
              className="text-xs font-semibold text-foreground"
            >
              Actual Physical Cash Counted (Kas Fisik Riil Rp)
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground font-semibold text-xs select-none">
                Rp
              </span>
              <Input
                id="edit-actual-cash"
                type="number"
                min="0"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="650000"
                className="h-10 pl-10 rounded-xl bg-background border-border/80 text-foreground text-sm font-mono font-bold focus-visible:ring-primary shadow-2xs w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>
          </div>

          {variance !== null && (
            <div
              className={cn(
                "p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-colors",
                isMatched &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                isOver &&
                  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
                isShort &&
                  "bg-destructive/10 text-destructive border-destructive/30",
              )}
            >
              <div className="flex items-center gap-1.5">
                {isMatched ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {isMatched
                    ? "Match"
                    : isOver
                      ? "Cash Surplus"
                      : "Cash Shortage"}
                </span>
              </div>
              <span className="font-mono text-sm font-extrabold">
                {isMatched
                  ? "Match"
                  : isOver
                    ? `+${formatRupiah(variance)}`
                    : `-${formatRupiah(Math.abs(variance))}`}
              </span>
            </div>
          )}
        </>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="edit-note"
            className="text-xs font-semibold text-foreground"
          >
            Session Notes
          </Label>
          <span className="text-[10px] text-muted-foreground font-mono">
            {note.length}/200
          </span>
        </div>
        <Textarea
          id="edit-note"
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Adjusted float input error..."
          className="min-h-16 rounded-xl bg-background border-border/80 text-xs resize-none"
        />
      </div>

      <DialogFooter className="pt-2 sm:pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-10 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 cursor-pointer"
        >
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
};

export const EditSessionDialog: React.FC<EditSessionDialogProps> = ({
  isOpen,
  onClose,
  session,
  onSave,
}) => {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="space-y-0.5 min-w-0 pr-6">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              Adjust Session #{session.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust session float, actual cash counted, or notes to fix input errors.
            </DialogDescription>
          </div>
        </DialogHeader>

        <EditSessionForm
          key={session.id}
          session={session}
          onClose={onClose}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
};
