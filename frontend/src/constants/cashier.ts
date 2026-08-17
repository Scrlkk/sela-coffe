export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  isDeleted?: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "espresso", label: "Espresso Based" },
  { id: "manual-brew", label: "Manual Brew" },
  { id: "non-coffee", label: "Non Coffee" },
  { id: "pastry", label: "Pastry & Bakery" },
  { id: "food", label: "Main Course" },
] as const;

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "p1",
    name: "Sela Signature Latte",
    category: "espresso",
    price: 28000,
    image: "☕",
    stock: 24,
  },
  {
    id: "p2",
    name: "Americano Double Shot",
    category: "espresso",
    price: 22000,
    image: "☕",
    stock: 40,
  },
  {
    id: "p3",
    name: "Caramel Macchiato",
    category: "espresso",
    price: 32000,
    image: "🧋",
    stock: 18,
  },
  {
    id: "p4",
    name: "V60 Japanese Iced Coffee",
    category: "manual-brew",
    price: 35000,
    image: "🧊",
    stock: 15,
  },
  {
    id: "p5",
    name: "Aeropress Beans Ethiopia",
    category: "manual-brew",
    price: 38000,
    image: "☕",
    stock: 10,
  },
  {
    id: "p6",
    name: "Matcha Oat Latte",
    category: "non-coffee",
    price: 30000,
    image: "🍵",
    stock: 22,
  },
  {
    id: "p7",
    name: "Artisan Chocolate Shake",
    category: "non-coffee",
    price: 29000,
    image: "🥤",
    stock: 16,
  },
  {
    id: "p8",
    name: "Butter Croissant",
    category: "pastry",
    price: 24000,
    image: "🥐",
    stock: 12,
  },
  {
    id: "p9",
    name: "Almond Pain au Chocolat",
    category: "pastry",
    price: 27000,
    image: "🥐",
    stock: 8,
  },
  {
    id: "p10",
    name: "Smoked Beef Croffle",
    category: "pastry",
    price: 32000,
    image: "🧇",
    stock: 14,
  },
  {
    id: "p11",
    name: "Nasi Goreng Sela Special",
    category: "food",
    price: 42000,
    image: "🍳",
    stock: 20,
  },
  {
    id: "p12",
    name: "Truffle Fries & Dip",
    category: "food",
    price: 28000,
    image: "🍟",
    stock: 25,
  },
];

