import type { IngredientItem } from "./ingredient";
import { getStoredIngredients, updateIngredient } from "./ingredient";
import { getStoredCategories } from "./category";

export interface StockItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  category_id: string;
  category_name: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  cost_price: number;
  unit: string;
  supplier_name?: string;
  image?: string;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export type StockLogType = "in" | "out" | "adjustment";

export interface StockLogItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  unit: string;
  user_id: string;
  user_name: string;
  type: StockLogType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reference_type?: string;
  note?: string;
  created_at: string;
}

const LOGS_STORAGE_KEY = "sela_stock_logs_data";

const mapIngredientToStock = (
  ing: IngredientItem,
  categoriesMap: Map<string, string>,
): StockItem => {
  return {
    id: `stk_${ing.id}`,
    product_id: ing.id,
    product_name: ing.name,
    sku: ing.sku,
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
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStockLogs = (logs: StockLogItem[]): void => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save stock logs to localStorage", e);
  }
};

export interface AdjustStockPayload {
  product_id: string; // Ingredient ID
  type: StockLogType;
  quantity: number;
  note?: string;
  reference_type?: string;
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
    sku: updatedIng.sku,
    unit: updatedIng.unit,
    user_id: "u_admin",
    user_name: payload.user_name || "Manager Barista",
    type: payload.type,
    quantity: Math.abs(payload.quantity),
    quantity_before: before,
    quantity_after: after,
    reference_type:
      payload.reference_type ||
      (payload.type === "in"
        ? "Supplier Restock Delivery"
        : payload.type === "out"
          ? "Bar Spoilage / Spillage"
          : "Physical Stock Opname"),
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
