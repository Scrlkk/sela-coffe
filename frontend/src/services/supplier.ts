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

export const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: "sup_1",
    name: "PT Sangkar Kopi Utama",
    contactPerson: "Pak Ahmad",
    phone: "081122334455",
    link: "https://tokopedia.com/sangkarkopi",
    address: "Jl. Merdeka No. 45, Bandung",
    isDeleted: false,
  },
  {
    id: "sup_2",
    name: "CV Java Roastery",
    contactPerson: "Ibu Dian",
    phone: "085678901234",
    link: "https://shopee.co.id/javaroastery",
    address: "Jl. Dipatiukur No. 12, Bandung",
    isDeleted: false,
  },
  {
    id: "sup_3",
    name: "UD Susu Fresh Farm",
    contactPerson: "Mas Budi",
    phone: "081987654321",
    link: "https://wa.me/6281987654321",
    address: "Jl. Raya Lembang No. 88, KBB",
    isDeleted: false,
  },
  {
    id: "sup_4",
    name: "PT Sirup Nusantara",
    contactPerson: "Siti Rahma",
    phone: "087711223344",
    link: "https://tokopedia.com/sirupnusantara",
    address: "Kawasan Industri Cimahi Blok C3",
    isDeleted: false,
  },
];

const STORAGE_KEY = "sela_suppliers_data";

export const getStoredSuppliers = (includeDeleted = false): SupplierItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const suppliers: SupplierItem[] = data ? JSON.parse(data) : INITIAL_SUPPLIERS;
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUPPLIERS));
    }
    return includeDeleted ? suppliers : suppliers.filter((s) => !s.isDeleted);
  } catch {
    return includeDeleted ? INITIAL_SUPPLIERS : INITIAL_SUPPLIERS.filter((s) => !s.isDeleted);
  }
};

export const saveSuppliers = (suppliers: SupplierItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
};

export const addSupplier = (supplier: Omit<SupplierItem, "id">): SupplierItem => {
  const all = getStoredSuppliers(true);
  const newSupplier: SupplierItem = {
    ...supplier,
    id: `sup_${Date.now()}`,
    isDeleted: false,
  };
  const updated = [newSupplier, ...all];
  saveSuppliers(updated);
  return newSupplier;
};

export const updateSupplier = (
  id: string,
  updatedFields: Partial<SupplierItem>
): SupplierItem | null => {
  const all = getStoredSuppliers(true);
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedItem = { ...all[index], ...updatedFields };
  all[index] = updatedItem;
  saveSuppliers(all);
  return updatedItem;
};

export const softDeleteSupplier = (id: string): boolean => {
  const all = getStoredSuppliers(true);
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return false;

  all[index].isDeleted = true;
  saveSuppliers(all);
  return true;
};

export const restoreSupplier = (id: string): boolean => {
  const all = getStoredSuppliers(true);
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return false;

  all[index].isDeleted = false;
  saveSuppliers(all);
  return true;
};
