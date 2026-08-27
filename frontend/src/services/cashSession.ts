import { safeStorage } from "@/utils/storage";
import { formatSessionDateTime } from "@/utils/formatDate";
import {
  INITIAL_HISTORY,
  type SessionHistoryItem,
} from "@/mocks/fixtures";

export type { SessionHistoryItem };

export interface ActiveCashSession {
  id: string;
  openedBy: string;
  openedAt: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  qrSales: number;
  totalOrders: number;
  isOpen: boolean;
}

const ACTIVE_SESSION_KEY = "sela_active_cash_session";
const HISTORY_KEY = "sela_cash_sessions_history";

export const cashSessionService = {
  getActiveSession(): ActiveCashSession | null {
    const raw = safeStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && parsed.isOpen ? parsed : null;
    } catch {
      return null;
    }
  },

  getNextSessionId(): string {
    const history = this.getSessionHistory();
    const active = this.getActiveSession();
    const allIds = [
      ...history.map((h) => h.id),
      active?.id,
    ].filter(Boolean) as string[];

    let maxNum = 841;
    for (const id of allIds) {
      const match = id.match(/SES-0*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `SES-${String(nextNum).padStart(4, "0")}`;
  },

  openSession(
    openingFloat: number,
    openedBy = "Kasir (kasir)",
  ): ActiveCashSession {
    const { fullStr } = formatSessionDateTime();
    const newSessionId = this.getNextSessionId();

    const newSession: ActiveCashSession = {
      id: newSessionId,
      openedBy,
      openedAt: fullStr,
      openingFloat: Number(openingFloat) || 0,
      cashSales: 0,
      cardSales: 0,
      qrSales: 0,
      totalOrders: 0,
      isOpen: true,
    };

    safeStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newSession));
    window.dispatchEvent(new Event("storage"));
    return newSession;
  },

  recordSale(method: string, totalAmount: number): void {
    const session = this.getActiveSession();
    if (!session) return;

    const amount = Number(totalAmount) || 0;
    if (method === "Cash") {
      session.cashSales += amount;
    } else if (method === "Card") {
      session.cardSales += amount;
    } else if (method === "QRIS") {
      session.qrSales += amount;
    }

    session.totalOrders += 1;
    safeStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("storage"));
  },

  closeSession(actualCash: number, note?: string): SessionHistoryItem | null {
    const session = this.getActiveSession();
    if (!session) return null;

    const { fullStr } = formatSessionDateTime();
    const numActualCash = Number(actualCash);
    const expectedCash = (session.openingFloat || 0) + (session.cashSales || 0);
    const variance = numActualCash - expectedCash;

    const historyItem: SessionHistoryItem = {
      id: session.id,
      openedBy: session.openedBy,
      openedAt: session.openedAt,
      closedAt: fullStr,
      openingFloat: session.openingFloat,
      cashSales: session.cashSales,
      cardSales: session.cardSales || 0,
      qrSales: session.qrSales || 0,
      expectedCash,
      actualCash: numActualCash,
      variance,
      note: note?.trim() || undefined,
      status: "completed",
    };

    const history = this.getSessionHistory();
    const updatedHistory = [
      historyItem,
      ...history.filter((item) => item.id !== session.id),
    ];
    safeStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    safeStorage.removeItem(ACTIVE_SESSION_KEY);
    window.dispatchEvent(new Event("storage"));
    return historyItem;
  },

  updateSession(
    sessionId: string,
    updates: Partial<SessionHistoryItem>,
  ): SessionHistoryItem | null {
    const active = this.getActiveSession();
    if (active && active.id === sessionId) {
      const updatedActive: ActiveCashSession = {
        ...active,
        openedBy: updates.openedBy ?? active.openedBy,
        openingFloat:
          updates.openingFloat !== undefined
            ? Number(updates.openingFloat)
            : active.openingFloat,
      };
      safeStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(updatedActive));
      window.dispatchEvent(new Event("storage"));
      return {
        id: updatedActive.id,
        openedBy: updatedActive.openedBy,
        openedAt: updatedActive.openedAt,
        closedAt: null,
        openingFloat: updatedActive.openingFloat,
        cashSales: updatedActive.cashSales,
        cardSales: updatedActive.cardSales,
        qrSales: updatedActive.qrSales,
        expectedCash: updatedActive.openingFloat + updatedActive.cashSales,
        actualCash: null,
        variance: null,
        status: "active",
      };
    }

    const history = this.getSessionHistory();
    const index = history.findIndex((item) => item.id === sessionId);
    if (index === -1) return null;

    const existing = history[index];
    const newOpeningFloat =
      updates.openingFloat !== undefined
        ? Number(updates.openingFloat)
        : existing.openingFloat;
    const newCashSales =
      updates.cashSales !== undefined
        ? Number(updates.cashSales)
        : existing.cashSales;
    const newExpectedCash = newOpeningFloat + newCashSales;
    const newActualCash =
      updates.actualCash !== undefined
        ? updates.actualCash !== null
          ? Number(updates.actualCash)
          : null
        : existing.actualCash;
    const newVariance =
      newActualCash !== null ? newActualCash - newExpectedCash : null;

    const updatedItem: SessionHistoryItem = {
      ...existing,
      ...updates,
      openingFloat: newOpeningFloat,
      cashSales: newCashSales,
      expectedCash: newExpectedCash,
      actualCash: newActualCash,
      variance: newVariance,
    };

    history[index] = updatedItem;
    safeStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event("storage"));
    return updatedItem;
  },

  getSessionHistory(): SessionHistoryItem[] {
    const raw = safeStorage.getItem(HISTORY_KEY);
    if (!raw) {
      safeStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return INITIAL_HISTORY;

      const seen = new Set<string>();
      const unique = parsed.filter((item) => {
        if (!item || !item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      return unique;
    } catch {
      return INITIAL_HISTORY;
    }
  },

  resetToInitial(): void {
    safeStorage.removeItem(ACTIVE_SESSION_KEY);
    safeStorage.setItem(HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
    window.dispatchEvent(new Event("storage"));
  },
};
