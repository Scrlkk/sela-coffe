export type CategoryType = "product" | "ingredient";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  type?: CategoryType;
  isDeleted?: boolean;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "espresso",
    name: "Espresso Based",
    description: "Espresso & espresso-based coffee drinks",
    type: "product",
    isDeleted: false,
  },
  {
    id: "manual-brew",
    name: "Manual Brew",
    description: "Filter coffee & artisan manual brews",
    type: "product",
    isDeleted: false,
  },
  {
    id: "non-coffee",
    name: "Non Coffee",
    description: "Tea, chocolate, and non-coffee beverages",
    type: "product",
    isDeleted: false,
  },
  {
    id: "pastry",
    name: "Pastry & Bakery",
    description: "Freshly baked croissants, pastries, & breads",
    type: "product",
    isDeleted: false,
  },
  {
    id: "food",
    name: "Main Course",
    description: "Delicious hot meals and savory dishes",
    type: "product",
    isDeleted: false,
  },
  {
    id: "coffee-beans",
    name: "Coffee Beans",
    description: "Single origin & espresso blend roasted beans",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "dairy-milk",
    name: "Dairy & Plant Milk",
    description: "Fresh milk, oat milk, almond milk, and creamers",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "syrup-flavor",
    name: "Syrup & Sauce",
    description: "Flavored syrups, caramel drizzles, and sauces",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "tea-powder",
    name: "Tea & Powders",
    description: "Matcha, cocoa powder, loose leaf teas, and powders",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "packaging",
    name: "Cups & Packaging",
    description: "Hot cups, cold cups, lids, straws, and take-away bags",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "bakery-ingredient",
    name: "Bakery Ingredients",
    description: "Flour, butter blocks, chocolates, and baking supplies",
    type: "ingredient",
    isDeleted: false,
  },
  {
    id: "other",
    name: "Other Supplies",
    description: "Cleaning supplies, filters, and operational items",
    type: "ingredient",
    isDeleted: false,
  },
];

const STORAGE_KEY = "sela_categories_data";

export const getStoredCategories = (
  includeDeleted = false,
  type?: CategoryType,
): CategoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let categories: CategoryItem[] = data
      ? JSON.parse(data)
      : INITIAL_CATEGORIES;

    let needsMigration = false;
    categories = categories.map((c) => {
      if (!c.type) {
        needsMigration = true;
        return { ...c, type: "product" as CategoryType };
      }
      return c;
    });

    const hasIngredientCats = categories.some((c) => c.type === "ingredient");
    if (!hasIngredientCats) {
      const initialIngredients = INITIAL_CATEGORIES.filter(
        (c) => c.type === "ingredient",
      );
      categories = [...categories, ...initialIngredients];
      needsMigration = true;
    }

    if (needsMigration || !data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }

    let result = includeDeleted
      ? categories
      : categories.filter((c) => !c.isDeleted);

    if (type) {
      result = result.filter((c) => (c.type || "product") === type);
    }

    return result;
  } catch {
    let result = includeDeleted
      ? INITIAL_CATEGORIES
      : INITIAL_CATEGORIES.filter((c) => !c.isDeleted);
    if (type) {
      result = result.filter((c) => (c.type || "product") === type);
    }
    return result;
  }
};

export const saveCategories = (categories: CategoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // safe fallback
  }
};

export const addCategory = (
  category: Omit<CategoryItem, "id">,
): CategoryItem => {
  const allCategories = getStoredCategories(true);
  const newCategory: CategoryItem = {
    ...category,
    type: category.type || "product",
    id:
      category.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || `cat_${Date.now()}`,
    isDeleted: false,
  };
  const updated = [newCategory, ...allCategories];
  saveCategories(updated);
  return newCategory;
};

export const updateCategory = (
  id: string,
  updatedFields: Partial<CategoryItem>,
): CategoryItem | null => {
  const allCategories = getStoredCategories(true);
  const index = allCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updatedItem = { ...allCategories[index], ...updatedFields };
  allCategories[index] = updatedItem;
  saveCategories(allCategories);
  return updatedItem;
};

export const softDeleteCategory = (id: string): boolean => {
  const allCategories = getStoredCategories(true);
  const index = allCategories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  allCategories[index].isDeleted = true;
  saveCategories(allCategories);
  return true;
};

export const restoreCategory = (id: string): boolean => {
  const allCategories = getStoredCategories(true);
  const index = allCategories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  allCategories[index].isDeleted = false;
  saveCategories(allCategories);
  return true;
};
