import { createStorageCrud } from "@/utils/createStorageCrud";
import { INITIAL_SUPPLIERS } from "@/mocks/fixtures";

export interface SupplierItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  link?: string;
  email?: string;
  address?: string;
  isDeleted?: boolean;
}

const supplierCrud = createStorageCrud<SupplierItem>(
  "sela_suppliers_data",
  INITIAL_SUPPLIERS,
  {
    generateId: () => `sup_${Date.now()}`,
  },
);

export const getStoredSuppliers = (includeDeleted = false): SupplierItem[] => {
  return supplierCrud.get(includeDeleted);
};

export const saveSuppliers = (suppliers: SupplierItem[]): void => {
  supplierCrud.save(suppliers);
};

export const addSupplier = (supplier: Omit<SupplierItem, "id">): SupplierItem => {
  return supplierCrud.add(supplier);
};

export const updateSupplier = (
  id: string,
  updatedFields: Partial<SupplierItem>,
): SupplierItem | null => {
  return supplierCrud.update(id, updatedFields);
};

export const softDeleteSupplier = (id: string): boolean => {
  return supplierCrud.softDelete(id);
};

export const restoreSupplier = (id: string): boolean => {
  return supplierCrud.restore(id);
};
