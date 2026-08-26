import type { ProductItem } from "@/constants/cashier";
import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_PRODUCTS } from "@/mocks/fixtures";

const productCrud = createStorageCrud<ProductItem>(
  "sela_products_data",
  INITIAL_PRODUCTS,
  {
    generateId: () => `p_${Date.now()}`,
    onCreate: (item) => ({
      is_active: item.is_active ?? true,
    }),
  },
);

export const getStoredProducts = (includeDeleted = false): ProductItem[] => {
  return productCrud.get(includeDeleted);
};

export const saveProducts = (products: ProductItem[]): void => {
  productCrud.save(products);
};

export const addProduct = (product: Omit<ProductItem, "id">): ProductItem => {
  return productCrud.add(product);
};

export const updateProduct = (
  id: string,
  updatedFields: Partial<ProductItem>,
): ProductItem | null => {
  return productCrud.update(id, updatedFields);
};

export const softDeleteProduct = (id: string): boolean => {
  return productCrud.softDelete(id);
};

export const restoreProduct = (id: string): boolean => {
  return productCrud.restore(id);
};
