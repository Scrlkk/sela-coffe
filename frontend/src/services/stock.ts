import type { IngredientItem } from "./ingredient";
import { getStoredIngredients, updateIngredient } from "./ingredient";
import { getStoredCategories } from "./category";
import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_STOCK_LOGS } from "@/mocks/fixtures";

export interface StockItem {
  id: string;
  product_id: string;
  product_name: string;
  category_id: string;
  category_name: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  cost_price: number;
  unit: string;
  supplier_name?: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export type StockLogType = "in" | "out" | "adjustment";

export interface StockLogItem {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  user_id: string;
  user_name: string;
  type: StockLogType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  note?: string;
  created_at: string;
}

const stockLogsCrud = createStorageCrud<StockLogItem>(
  "sela_stock_logs_v2",
  INITIAL_STOCK_LOGS,
);

const mapIngredientToStock = (
  ing: IngredientItem,
  categoriesMap: Map<string, string>,
): StockItem => {
  return {
    id: `stk_${ing.id}`,
    product_id: ing.id,
    product_name: ing.name,
    category_id: ing.category,
    category_name: categoriesMap.get(ing.category) || ing.category,
    quantity: ing.currentStock ?? 0,
    min_stock: ing.minStock ?? 50,
    max_stock: ing.maxStock ?? 1000,
    cost_price: ing.costPrice,
    unit: ing.unit,
    supplier_name: ing.supplierName,
    is_active: !ing.isDeleted,
    updated_at: ing.updatedAt || new Date().toISOString(),
    created_at: ing.createdAt || new Date().toISOString(),
  };
};

export const getStoredStocks = (): StockItem[] => {
  try {
    const ingredients = getStoredIngredients(false);
    const categories = getStoredCategories(false, "ingredient");
    const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));

    return ingredients.map((ing) => mapIngredientToStock(ing, categoriesMap));
  } catch (e) {
    console.error("Failed to load stocks from ingredients:", e);
    return [];
  }
};

export const getStoredStockLogs = (): StockLogItem[] => {
  return stockLogsCrud.getRaw();
};

export const saveStockLogs = (logs: StockLogItem[]): void => {
  stockLogsCrud.save(logs);
  window.dispatchEvent(new Event("storage"));
};

export interface AdjustStockPayload {
  product_id: string;
  type: StockLogType;
  quantity: number;
  note?: string;
  user_name?: string;
}

export const adjustStock = (
  payload: AdjustStockPayload,
): { stock: StockItem; log: StockLogItem } | null => {
  const ingredients = getStoredIngredients(true);
  const targetIng = ingredients.find((i) => i.id === payload.product_id);
  if (!targetIng) return null;

  const before = targetIng.currentStock ?? 0;
  let after = before;

  if (payload.type === "in") {
    after = before + Math.abs(payload.quantity);
  } else if (payload.type === "out") {
    after = Math.max(0, before - Math.abs(payload.quantity));
  } else if (payload.type === "adjustment") {
    after = Math.max(0, payload.quantity);
  }

  const updatedIng = updateIngredient(targetIng.id, {
    currentStock: after,
  });

  if (!updatedIng) return null;

  const categories = getStoredCategories(false, "ingredient");
  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
  const updatedStock = mapIngredientToStock(updatedIng, categoriesMap);

  const log: StockLogItem = {
    id: `log_${Date.now()}`,
    product_id: updatedIng.id,
    product_name: updatedIng.name,
    unit: updatedIng.unit,
    user_id: "u_admin",
    user_name: payload.user_name || "Manager Barista",
    type: payload.type,
    quantity: Math.abs(payload.quantity),
    quantity_before: before,
    quantity_after: after,
    note: payload.note || "",
    created_at: new Date().toISOString(),
  };

  const logs = getStoredStockLogs();
  saveStockLogs([log, ...logs]);

  return { stock: updatedStock, log };
};

export const updateStockLimits = (
  ingredientId: string,
  limits: { min_stock?: number; max_stock?: number },
): StockItem | null => {
  const updatedIng = updateIngredient(ingredientId, {
    minStock: limits.min_stock,
    maxStock: limits.max_stock,
  });

  if (!updatedIng) return null;

  const categories = getStoredCategories(false, "ingredient");
  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
  return mapIngredientToStock(updatedIng, categoriesMap);
};
