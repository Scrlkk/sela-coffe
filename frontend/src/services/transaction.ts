import { createStorageCrud } from "@/utils/createStorageCrud";
import {
  INITIAL_TRANSACTIONS,
  type TransactionItem,
  type TransactionItemLine,
  type PaymentMethod,
  type TransactionStatus,
} from "@/mocks/fixtures";

export type {
  TransactionItem,
  TransactionItemLine,
  PaymentMethod,
  TransactionStatus,
};

export const generateInvoiceNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `INV-${dateStr}-${randomSuffix}`;
};

const transactionsCrud = createStorageCrud<TransactionItem>(
  "sela_transactions_data",
  INITIAL_TRANSACTIONS,
  {
    generateId: () =>
      `trx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    onCreate: (item) => {
      const now = new Date().toISOString();
      return {
        invoice_number: item.invoice_number || generateInvoiceNumber(),
        status: item.status || "paid",
        created_at: now,
        updated_at: now,
        isDeleted: false,
      };
    },
    onUpdate: () => ({
      updated_at: new Date().toISOString(),
    }),
    migrate: (items) => {
      const existingIds = new Set(items.map((i) => i.id));
      const newItems = INITIAL_TRANSACTIONS.filter(
        (i) => !existingIds.has(i.id),
      );
      if (newItems.length > 0) {
        return [...items, ...newItems];
      }
      return items;
    },
  },
);

export const getStoredTransactions = (
  includeDeleted = false,
): TransactionItem[] => {
  return transactionsCrud.get(includeDeleted);
};

export const saveTransactions = (transactions: TransactionItem[]): void => {
  transactionsCrud.save(transactions);
};

export const addTransaction = (
  trx: Omit<TransactionItem, "id" | "created_at" | "updated_at"> &
    Partial<Pick<TransactionItem, "id" | "created_at" | "updated_at">>,
): TransactionItem => {
  const result = transactionsCrud.add(trx as Omit<TransactionItem, "id">);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
  return result;
};

export const cancelTransaction = (id: string, reason?: string): boolean => {
  const trx = transactionsCrud.get(true).find((t) => t.id === id);
  if (!trx || trx.status === "cancelled") return false;

  const result = transactionsCrud.update(id, {
    status: "cancelled",
    notes: reason
      ? `${trx.notes ? trx.notes + " | " : ""}Pembatalan: ${reason}`
      : trx.notes,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
  return Boolean(result);
};

export const softDeleteTransaction = (id: string): boolean => {
  const result = transactionsCrud.softDelete(id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
  return result;
};

export const restoreTransaction = (id: string): boolean => {
  const result = transactionsCrud.restore(id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
  }
  return result;
};
