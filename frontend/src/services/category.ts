import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_CATEGORIES } from "@/mocks/fixtures";

export type CategoryType = "product" | "ingredient";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  type?: CategoryType;
  isDeleted?: boolean;
}

const categoryCrud = createStorageCrud<CategoryItem>(
  "sela_categories_data",
  INITIAL_CATEGORIES,
  {
    generateId: (item) =>
      item.name
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || `cat_${Date.now()}`,
    onCreate: (item) => ({
      type: item.type || "product",
    }),
    migrate: (categories) => {
      const hasIngredientCats = categories.some((c) => c.type === "ingredient");
      if (!hasIngredientCats) {
        const initialIngredients = INITIAL_CATEGORIES.filter(
          (c) => c.type === "ingredient",
        );
        return [...categories, ...initialIngredients];
      }
      return categories;
    },
  },
);

export const getStoredCategories = (
  includeDeleted = false,
  type?: CategoryType,
): CategoryItem[] => {
  const result = categoryCrud.get(includeDeleted);
  if (type) {
    return result.filter((c) => (c.type || "product") === type);
  }
  return result;
};

export const saveCategories = (categories: CategoryItem[]): void => {
  categoryCrud.save(categories);
};

export const addCategory = (
  category: Omit<CategoryItem, "id">,
): CategoryItem => {
  return categoryCrud.add(category);
};

export const updateCategory = (
  id: string,
  updatedFields: Partial<CategoryItem>,
): CategoryItem | null => {
  return categoryCrud.update(id, updatedFields);
};

export const softDeleteCategory = (id: string): boolean => {
  return categoryCrud.softDelete(id);
};

export const restoreCategory = (id: string): boolean => {
  return categoryCrud.restore(id);
};
