import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_INGREDIENTS } from "@/mocks/fixtures";

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

const ingredientCrud = createStorageCrud<IngredientItem>(
  "sela_ingredients_data",
  INITIAL_INGREDIENTS,
  {
    generateId: () => `ing_${Date.now()}`,
    onCreate: () => ({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    onUpdate: () => ({
      updatedAt: new Date().toISOString(),
    }),
    onDelete: () => ({
      updatedAt: new Date().toISOString(),
    }),
    onRestore: () => ({
      updatedAt: new Date().toISOString(),
    }),
  },
);

export const getStoredIngredients = (
  includeDeleted = false,
): IngredientItem[] => {
  return ingredientCrud.get(includeDeleted);
};

export const saveIngredients = (items: IngredientItem[]): void => {
  ingredientCrud.save(items);
};

export const addIngredient = (
  item: Omit<IngredientItem, "id" | "createdAt" | "updatedAt" | "isDeleted"> &
    Partial<Pick<IngredientItem, "createdAt" | "updatedAt" | "isDeleted">>,
): IngredientItem => {
  return ingredientCrud.add(item as Omit<IngredientItem, "id">);
};

export const updateIngredient = (
  id: string,
  updatedFields: Partial<IngredientItem>,
): IngredientItem | null => {
  return ingredientCrud.update(id, updatedFields);
};

export const softDeleteIngredient = (id: string): boolean => {
  return ingredientCrud.softDelete(id);
};

export const restoreIngredient = (id: string): boolean => {
  return ingredientCrud.restore(id);
};
