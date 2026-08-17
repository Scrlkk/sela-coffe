export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  isDeleted?: boolean;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "espresso", name: "Espresso Based", description: "Espresso & espresso-based coffee drinks", isDeleted: false },
  { id: "manual-brew", name: "Manual Brew", description: "Filter coffee & artisan manual brews", isDeleted: false },
  { id: "non-coffee", name: "Non Coffee", description: "Tea, chocolate, and non-coffee beverages", isDeleted: false },
  { id: "pastry", name: "Pastry & Bakery", description: "Freshly baked croissants, pastries, & breads", isDeleted: false },
  { id: "food", name: "Main Course", description: "Delicious hot meals and savory dishes", isDeleted: false },
];

const STORAGE_KEY = "sela_categories_data";

export const getStoredCategories = (includeDeleted = false): CategoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const categories: CategoryItem[] = data ? JSON.parse(data) : INITIAL_CATEGORIES;
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
    }
    return includeDeleted ? categories : categories.filter((c) => !c.isDeleted);
  } catch {
    return includeDeleted ? INITIAL_CATEGORIES : INITIAL_CATEGORIES.filter((c) => !c.isDeleted);
  }
};

export const saveCategories = (categories: CategoryItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
};

export const addCategory = (category: Omit<CategoryItem, "id">): CategoryItem => {
  const allCategories = getStoredCategories(true);
  const newCategory: CategoryItem = {
    ...category,
    id: category.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `cat_${Date.now()}`,
    isDeleted: false,
  };
  const updated = [newCategory, ...allCategories];
  saveCategories(updated);
  return newCategory;
};

export const updateCategory = (id: string, updatedFields: Partial<CategoryItem>): CategoryItem | null => {
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

export const deleteCategory = softDeleteCategory;
