export type PaymentMethod = "cash" | "qris" | "card";
export type TransactionStatus = "paid" | "cancelled" | "refunded";

export interface TransactionItemLine {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionItem {
  id: string;
  invoice_number: string;
  session_id?: string;
  cashier_name: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  items: TransactionItemLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  notes?: string;
  isDeleted: boolean;
  created_at: string;
  updated_at: string;
}

export const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "trx_1724982000001",
    invoice_number: "INV-202608-101",
    session_id: "SES-0841",
    cashier_name: "Budi Santoso",
    payment_method: "qris",
    status: "paid",
    items: [
      {
        product_id: "p1",
        product_name: "Sela Signature Latte",
        price: 28000,
        quantity: 2,
        subtotal: 56000,
      },
      {
        product_id: "p8",
        product_name: "Butter Croissant",
        price: 24000,
        quantity: 1,
        subtotal: 24000,
      },
    ],
    subtotal: 80000,
    tax: 8000,
    discount: 0,
    total_amount: 88000,
    paid_amount: 88000,
    change_amount: 0,
    notes: "Dine in - Meja 04",
    isDeleted: false,
    created_at: "2026-08-30T10:15:00.000Z",
    updated_at: "2026-08-30T10:15:00.000Z",
  },
  {
    id: "trx_1724982000002",
    invoice_number: "INV-202608-102",
    session_id: "SES-0841",
    cashier_name: "Siti Rahma",
    payment_method: "cash",
    status: "paid",
    items: [
      {
        product_id: "p3",
        product_name: "Caramel Macchiato",
        price: 32000,
        quantity: 1,
        subtotal: 32000,
      },
      {
        product_id: "p10",
        product_name: "Smoked Beef Croffle",
        price: 32000,
        quantity: 1,
        subtotal: 32000,
      },
    ],
    subtotal: 64000,
    tax: 6400,
    discount: 0,
    total_amount: 70400,
    paid_amount: 100000,
    change_amount: 29600,
    notes: "Take away",
    isDeleted: false,
    created_at: "2026-08-30T09:42:00.000Z",
    updated_at: "2026-08-30T09:42:00.000Z",
  },
  {
    id: "trx_1724982000003",
    invoice_number: "INV-202608-103",
    session_id: "SES-0841",
    cashier_name: "Budi Santoso",
    payment_method: "card",
    status: "paid",
    items: [
      {
        product_id: "p4",
        product_name: "V60 Japanese Iced Coffee",
        price: 35000,
        quantity: 2,
        subtotal: 70000,
      },
      {
        product_id: "p12",
        product_name: "Truffle Fries & Dip",
        price: 28000,
        quantity: 1,
        subtotal: 28000,
      },
    ],
    subtotal: 98000,
    tax: 9800,
    discount: 0,
    total_amount: 107800,
    paid_amount: 107800,
    change_amount: 0,
    notes: "Dine in - Meja 02 (Mandiri Debit)",
    isDeleted: false,
    created_at: "2026-08-30T08:30:00.000Z",
    updated_at: "2026-08-30T08:30:00.000Z",
  },
  {
    id: "trx_1724982000004",
    invoice_number: "INV-202608-104",
    session_id: "SES-0841",
    cashier_name: "Siti Rahma",
    payment_method: "cash",
    status: "cancelled",
    items: [
      {
        product_id: "p2",
        product_name: "Americano Double Shot",
        price: 22000,
        quantity: 1,
        subtotal: 22000,
      },
    ],
    subtotal: 22000,
    tax: 2200,
    discount: 0,
    total_amount: 24200,
    paid_amount: 24200,
    change_amount: 0,
    notes: "Pembatalan: Salah pesan item",
    isDeleted: false,
    created_at: "2026-08-29T16:20:00.000Z",
    updated_at: "2026-08-29T16:25:00.000Z",
  },
  {
    id: "trx_1724982000005",
    invoice_number: "INV-202608-105",
    session_id: "SES-0840",
    cashier_name: "Kasir Sela",
    payment_method: "qris",
    status: "paid",
    items: [
      {
        product_id: "p6",
        product_name: "Matcha Oat Latte",
        price: 30000,
        quantity: 2,
        subtotal: 60000,
      },
      {
        product_id: "p9",
        product_name: "Almond Pain au Chocolat",
        price: 27000,
        quantity: 2,
        subtotal: 54000,
      },
    ],
    subtotal: 114000,
    tax: 11400,
    discount: 0,
    total_amount: 125400,
    paid_amount: 125400,
    change_amount: 0,
    notes: "QRIS BCA",
    isDeleted: false,
    created_at: "2026-08-29T14:10:00.000Z",
    updated_at: "2026-08-29T14:10:00.000Z",
  },
  {
    id: "trx_1724982000006",
    invoice_number: "INV-202608-106",
    session_id: "SES-0840",
    cashier_name: "Budi Santoso",
    payment_method: "card",
    status: "paid",
    items: [
      {
        product_id: "p11",
        product_name: "Nasi Goreng Sela Special",
        price: 42000,
        quantity: 2,
        subtotal: 84000,
      },
      {
        product_id: "p2",
        product_name: "Americano Double Shot",
        price: 22000,
        quantity: 2,
        subtotal: 44000,
      },
    ],
    subtotal: 128000,
    tax: 12800,
    discount: 0,
    total_amount: 140800,
    paid_amount: 140800,
    change_amount: 0,
    notes: "Dine in - Meja 08",
    isDeleted: false,
    created_at: "2026-08-28T19:05:00.000Z",
    updated_at: "2026-08-28T19:05:00.000Z",
  },
  {
    id: "trx_1724982000007",
    invoice_number: "INV-202608-107",
    session_id: "SES-0839",
    cashier_name: "Siti Rahma",
    payment_method: "cash",
    status: "paid",
    items: [
      {
        product_id: "p7",
        product_name: "Artisan Chocolate Shake",
        price: 29000,
        quantity: 1,
        subtotal: 29000,
      },
      {
        product_id: "p8",
        product_name: "Butter Croissant",
        price: 24000,
        quantity: 1,
        subtotal: 24000,
      },
    ],
    subtotal: 53000,
    tax: 5300,
    discount: 0,
    total_amount: 58300,
    paid_amount: 60000,
    change_amount: 1700,
    notes: "Take away",
    isDeleted: false,
    created_at: "2026-08-27T11:50:00.000Z",
    updated_at: "2026-08-27T11:50:00.000Z",
  },
  {
    id: "trx_1724982000008",
    invoice_number: "INV-202608-108",
    session_id: "SES-0839",
    cashier_name: "Budi Santoso",
    payment_method: "qris",
    status: "paid",
    items: [
      {
        product_id: "p5",
        product_name: "Aeropress Beans Ethiopia",
        price: 38000,
        quantity: 1,
        subtotal: 38000,
      },
      {
        product_id: "p1",
        product_name: "Sela Signature Latte",
        price: 28000,
        quantity: 1,
        subtotal: 28000,
      },
    ],
    subtotal: 66000,
    tax: 6600,
    discount: 0,
    total_amount: 72600,
    paid_amount: 72600,
    change_amount: 0,
    notes: "QRIS GoPay",
    isDeleted: false,
    created_at: "2026-08-26T15:30:00.000Z",
    updated_at: "2026-08-26T15:30:00.000Z",
  },
  {
    id: "trx_1724982000009",
    invoice_number: "INV-202608-109",
    session_id: "SES-0838",
    cashier_name: "Kasir Sela",
    payment_method: "cash",
    status: "cancelled",
    items: [
      {
        product_id: "p1",
        product_name: "Sela Signature Latte",
        price: 28000,
        quantity: 3,
        subtotal: 84000,
      },
    ],
    subtotal: 84000,
    tax: 8400,
    discount: 0,
    total_amount: 92400,
    paid_amount: 100000,
    change_amount: 7600,
    notes: "Pembatalan: Salah input jumlah pesanan",
    isDeleted: false,
    created_at: "2026-08-25T13:10:00.000Z",
    updated_at: "2026-08-25T13:12:00.000Z",
  },
  {
    id: "trx_1724982000010",
    invoice_number: "INV-202608-110",
    session_id: "SES-0838",
    cashier_name: "Siti Rahma",
    payment_method: "qris",
    status: "paid",
    items: [
      {
        product_id: "p3",
        product_name: "Caramel Macchiato",
        price: 32000,
        quantity: 2,
        subtotal: 64000,
      },
      {
        product_id: "p12",
        product_name: "Truffle Fries & Dip",
        price: 28000,
        quantity: 2,
        subtotal: 56000,
      },
    ],
    subtotal: 120000,
    tax: 12000,
    discount: 0,
    total_amount: 132000,
    paid_amount: 132000,
    change_amount: 0,
    notes: "Dine in - Outdoor",
    isDeleted: false,
    created_at: "2026-08-24T18:40:00.000Z",
    updated_at: "2026-08-24T18:40:00.000Z",
  },
];
