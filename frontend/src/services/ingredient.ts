export type IngredientCategory =
  | "coffee-beans"
  | "dairy-milk"
  | "syrup-flavor"
  | "tea-powder"
  | "packaging"
  | "bakery-ingredient"
  | "other";

export interface IngredientItem {
  id: string;
  name: string;
  sku: string;
  category: IngredientCategory | string;
  unit: string;
  costPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "sela_ingredients_data";

export const INITIAL_INGREDIENTS: IngredientItem[] = [
  {
    id: "ing_1",
    name: "Arabica House Blend Beans",
    sku: "RAW-BNS-001",
    category: "coffee-beans",
    unit: "gram",
    costPrice: 220,
    currentStock: 4500,
    minStock: 1000,
    maxStock: 10000,
    supplierId: "sup_1",
    supplierName: "PT Sangkar Kopi Utama",
    notes: "Medium dark roast blend 70% Arabica 30% Robusta",
    isDeleted: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_2",
    name: "Fresh Milk Full Cream (Diamond)",
    sku: "RAW-MLK-002",
    category: "dairy-milk",
    unit: "ml",
    costPrice: 20,
    currentStock: 18000,
    minStock: 5000,
    maxStock: 30000,
    supplierId: "sup_3",
    supplierName: "UD Susu Fresh Farm",
    notes: "Pasteurized fresh milk 1L carton",
    isDeleted: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_3",
    name: "Oat Milk Barista Edition",
    sku: "RAW-OAT-003",
    category: "dairy-milk",
    unit: "ml",
    costPrice: 45,
    currentStock: 6000,
    minStock: 2000,
    maxStock: 15000,
    supplierId: "sup_3",
    supplierName: "UD Susu Fresh Farm",
    notes: "Oatside barista edition 1L",
    isDeleted: false,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_4",
    name: "Vanilla Artisan Syrup (Monin)",
    sku: "RAW-SYR-004",
    category: "syrup-flavor",
    unit: "ml",
    costPrice: 180,
    currentStock: 1500,
    minStock: 500,
    maxStock: 4000,
    supplierId: "sup_4",
    supplierName: "PT Sirup Nusantara",
    notes: "700ml glass bottle syrup",
    isDeleted: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_5",
    name: "Caramel Gourmet Sauce",
    sku: "RAW-CAR-005",
    category: "syrup-flavor",
    unit: "ml",
    costPrice: 160,
    currentStock: 400,
    minStock: 500,
    maxStock: 3000,
    supplierId: "sup_4",
    supplierName: "PT Sirup Nusantara",
    notes: "Thick caramel squeeze drizzle",
    isDeleted: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_6",
    name: "Uji Matcha Ceremonial Powder",
    sku: "RAW-MTC-006",
    category: "tea-powder",
    unit: "gram",
    costPrice: 650,
    currentStock: 800,
    minStock: 300,
    maxStock: 2000,
    supplierId: "sup_1",
    supplierName: "PT Sangkar Kopi Utama",
    notes: "Pure Japanese Green Tea powder",
    isDeleted: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_7",
    name: "Dark Cocoa Pure Powder 100%",
    sku: "RAW-CHO-007",
    category: "tea-powder",
    unit: "gram",
    costPrice: 200,
    currentStock: 1200,
    minStock: 400,
    maxStock: 3000,
    supplierId: "sup_4",
    supplierName: "PT Sirup Nusantara",
    notes: "Unsweetened pure Dutch processed cocoa",
    isDeleted: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_8",
    name: "Hot Paper Cup 8oz + Lid",
    sku: "RAW-CUP-008",
    category: "packaging",
    unit: "pcs",
    costPrice: 650,
    currentStock: 250,
    minStock: 100,
    maxStock: 1000,
    supplierId: "sup_1",
    supplierName: "PT Sangkar Kopi Utama",
    notes: "Double wall kraft paper cup with lid",
    isDeleted: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_9",
    name: "Cold Cup PET 16oz + Strawless Lid",
    sku: "RAW-PET-009",
    category: "packaging",
    unit: "pcs",
    costPrice: 850,
    currentStock: 0,
    minStock: 150,
    maxStock: 1200,
    supplierId: "sup_1",
    supplierName: "PT Sangkar Kopi Utama",
    notes: "High clarity plastic cold cup",
    isDeleted: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ing_10",
    name: "French Butter Block AOP",
    sku: "RAW-BTR-010",
    category: "bakery-ingredient",
    unit: "gram",
    costPrice: 140,
    currentStock: 1500,
    minStock: 500,
    maxStock: 4000,
    supplierId: "sup_3",
    supplierName: "UD Susu Fresh Farm",
    notes: "Unsalted laminated croissant butter",
    isDeleted: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getStoredIngredients = (
  includeDeleted = false,
): IngredientItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items: IngredientItem[] = data
      ? JSON.parse(data)
      : INITIAL_INGREDIENTS;
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INGREDIENTS));
    }
    return includeDeleted ? items : items.filter((i) => !i.isDeleted);
  } catch {
    return includeDeleted
      ? INITIAL_INGREDIENTS
      : INITIAL_INGREDIENTS.filter((i) => !i.isDeleted);
  }
};

export const saveIngredients = (items: IngredientItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // safe fallback
  }
};

export const addIngredient = (
  item: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted">,
): IngredientItem => {
  const all = getStoredIngredients(true);
  const newIngredient: IngredientItem = {
    ...item,
    id: `ing_${Date.now()}`,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newIngredient, ...all];
  saveIngredients(updated);
  return newIngredient;
};

export const updateIngredient = (
  id: string,
  updatedFields: Partial<IngredientItem>,
): IngredientItem | null => {
  const all = getStoredIngredients(true);
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const updatedItem: IngredientItem = {
    ...all[index],
    ...updatedFields,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updatedItem;
  saveIngredients(all);
  return updatedItem;
};

export const softDeleteIngredient = (id: string): boolean => {
  const all = getStoredIngredients(true);
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return false;

  all[index].isDeleted = true;
  all[index].updatedAt = new Date().toISOString();
  saveIngredients(all);
  return true;
};

export const restoreIngredient = (id: string): boolean => {
  const all = getStoredIngredients(true);
  const index = all.findIndex((i) => i.id === id);
  if (index === -1) return false;

  all[index].isDeleted = false;
  all[index].updatedAt = new Date().toISOString();
  saveIngredients(all);
  return true;
};
