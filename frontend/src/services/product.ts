import type { ProductItem } from "@/constants/cashier";
import { PRODUCTS_DATA } from "@/constants/cashier";

const STORAGE_KEY = "sela_products_data";

export const getStoredProducts = (includeDeleted = false): ProductItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const products: ProductItem[] = data ? JSON.parse(data) : PRODUCTS_DATA;
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS_DATA));
    }
    return includeDeleted ? products : products.filter((p) => !p.isDeleted);
  } catch {
    return includeDeleted ? PRODUCTS_DATA : PRODUCTS_DATA.filter((p) => !p.isDeleted);
  }
};

export const saveProducts = (products: ProductItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const addProduct = (product: Omit<ProductItem, "id">): ProductItem => {
  const allProducts = getStoredProducts(true);
  const newProduct: ProductItem = {
    ...product,
    id: `p_${Date.now()}`,
    isDeleted: false,
  };
  const updated = [newProduct, ...allProducts];
  saveProducts(updated);
  return newProduct;
};

export const updateProduct = (id: string, updatedFields: Partial<ProductItem>): ProductItem | null => {
  const allProducts = getStoredProducts(true);
  const index = allProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  const updatedItem = { ...allProducts[index], ...updatedFields };
  allProducts[index] = updatedItem;
  saveProducts(allProducts);
  return updatedItem;
};

export const softDeleteProduct = (id: string): boolean => {
  const allProducts = getStoredProducts(true);
  const index = allProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  allProducts[index].isDeleted = true;
  saveProducts(allProducts);
  return true;
};

export const restoreProduct = (id: string): boolean => {
  const allProducts = getStoredProducts(true);
  const index = allProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  allProducts[index].isDeleted = false;
  saveProducts(allProducts);
  return true;
};

export const deleteProduct = softDeleteProduct;
