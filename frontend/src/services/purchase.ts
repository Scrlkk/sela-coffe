import { createStorageCrud } from "@/utils/createStorageCrud";
import {
  INITIAL_PURCHASE_ORDERS,
  type PurchaseOrderItem,
  type PurchaseOrderItemLine,
  type PurchaseOrderStatus,
} from "@/mocks/fixtures";
import { adjustStock } from "./stock";

export type { PurchaseOrderItem, PurchaseOrderItemLine, PurchaseOrderStatus };

const generatePoNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `PO-${dateStr}-${randomSuffix}`;
};

const purchasesCrud = createStorageCrud<PurchaseOrderItem>(
  "sela_purchases_data",
  INITIAL_PURCHASE_ORDERS,
  {
    generateId: () =>
      `po_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    onCreate: (item) => {
      const now = new Date().toISOString();
      return {
        po_number: item.po_number || generatePoNumber(),
        status: item.status || "PENDING",
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      };
    },
    onUpdate: () => ({
      updatedAt: new Date().toISOString(),
    }),
    migrate: (items) => {
      const existingIds = new Set(items.map((i) => i.id));
      const newItems = INITIAL_PURCHASE_ORDERS.filter(
        (i) => !existingIds.has(i.id),
      );
      if (newItems.length > 0) {
        return [...items, ...newItems];
      }
      return items;
    },
  },
);

export const getStoredPurchaseOrders = (
  includeDeleted = false,
): PurchaseOrderItem[] => {
  return purchasesCrud.get(includeDeleted);
};

export const savePurchaseOrders = (orders: PurchaseOrderItem[]): void => {
  purchasesCrud.save(orders);
};

export const addPurchaseOrder = (
  po: Omit<PurchaseOrderItem, "id" | "po_number" | "createdAt" | "updatedAt"> &
    Partial<Pick<PurchaseOrderItem, "po_number" | "createdAt" | "updatedAt">>,
): PurchaseOrderItem => {
  const result = purchasesCrud.add(po as Omit<PurchaseOrderItem, "id">);
  window.dispatchEvent(new Event("storage"));
  return result;
};

export const updatePurchaseOrder = (
  id: string,
  updatedFields: Partial<PurchaseOrderItem>,
): PurchaseOrderItem | null => {
  const result = purchasesCrud.update(id, updatedFields);
  window.dispatchEvent(new Event("storage"));
  return result;
};

export const cancelPurchaseOrder = (id: string, note?: string): boolean => {
  const po = purchasesCrud.get(true).find((p) => p.id === id);
  if (!po || po.status === "RECEIVED") return false;

  const result = purchasesCrud.update(id, {
    status: "CANCELLED",
    notes: note
      ? `${po.notes ? po.notes + " | " : ""}Batal: ${note}`
      : po.notes,
  });

  window.dispatchEvent(new Event("storage"));
  return Boolean(result);
};

export const receivePurchaseOrder = (
  id: string,
  receivedItems: { ingredient_id: string; received_quantity: number }[],
  notes?: string,
): boolean => {
  const po = purchasesCrud.get(true).find((p) => p.id === id);
  if (!po || po.status === "RECEIVED") return false;

  const updatedLineItems: PurchaseOrderItemLine[] = po.items.map((line) => {
    const matching = receivedItems.find(
      (r) => r.ingredient_id === line.ingredient_id,
    );
    const qtyReceived =
      matching !== undefined ? matching.received_quantity : line.quantity;

    if (qtyReceived > 0) {
      adjustStock({
        product_id: line.ingredient_id,
        type: "in",
        quantity: qtyReceived,
        user_name: "Procurement Manager",
        note: `PO: ${po.po_number} - ${po.supplier_name}`,
      });
    }

    return {
      ...line,
      received_quantity: qtyReceived,
    };
  });

  const now = new Date().toISOString();
  const updatedPo = purchasesCrud.update(id, {
    status: "RECEIVED",
    received_date: now,
    items: updatedLineItems,
    notes: notes ? `${po.notes ? po.notes + " | " : ""}${notes}` : po.notes,
    updatedAt: now,
  });

  window.dispatchEvent(new Event("storage"));
  return Boolean(updatedPo);
};

export const softDeletePurchaseOrder = (id: string): boolean => {
  const result = purchasesCrud.softDelete(id);
  window.dispatchEvent(new Event("storage"));
  return result;
};

export const restorePurchaseOrder = (id: string): boolean => {
  const result = purchasesCrud.restore(id);
  window.dispatchEvent(new Event("storage"));
  return result;
};
