import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Truck,
  Users,
  Warehouse,
  ArrowLeftRight,
  FileSpreadsheet,
  Wheat,
  ReceiptText,
  Banknote,
  TrendingUp,
  Flame,
  Boxes,
  ShoppingBag,
} from "lucide-react";

export interface RouteInfo {
  title: string;
  description: string;
}

export const ROUTE_META: Record<string, RouteInfo> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Overview of your coffee shop performance & statistics today",
  },
  "/cashier": {
    title: "POS Cashier",
    description: "Manage customer orders, transactions, and payments",
  },
  "/products": {
    title: "Product Management",
    description: "Manage menu items, prices, and product variants",
  },
  "/ingredients": {
    title: "Raw Ingredients",
    description: "Manage coffee beans, milk, syrups, powders, and packaging",
  },
  "/categories": {
    title: "Categories",
    description: "Organize menu products and raw ingredient categories",
  },
  "/suppliers": {
    title: "Suppliers",
    description: "Manage ingredient and inventory suppliers",
  },
  "/users": {
    title: "User Management",
    description: "Manage user accounts, roles, and access permissions",
  },
  "/stock": {
    title: "Current Stock",
    description: "Monitor inventory levels and item availability",
  },
  "/stock-movement": {
    title: "Stock Movement",
    description: "History of stock entries and dispatches",
  },
  "/stock-adjustment": {
    title: "Stock Adjustment",
    description: "Adjust and correct stock audit quantities",
  },
  "/purchases": {
    title: "Purchase Orders",
    description: "Manage supplier purchase orders and procurement",
  },
  "/purchases/receive": {
    title: "Goods Receiving",
    description: "Record received goods from suppliers",
  },
  "/transactions": {
    title: "Transaction History",
    description: "Sales transactions list and details",
  },
  "/cash-sessions": {
    title: "Cash Sessions",
    description: "Register open and close cash register sessions",
  },
  "/profile": {
    title: "Profile Settings",
    description: "Manage your profile information and account security",
  },
  "/reports/sales": {
    title: "Sales Report",
    description: "Detailed sales revenue, transaction trends, and payment summaries",
  },
  "/reports/best-sellers": {
    title: "Best Seller Report",
    description: "Top performing menu items, high-volume products, and item rankings",
  },
  "/reports/inventory": {
    title: "Inventory Report",
    description: "Stock valuation, stock turnover, usage rate, and waste tracking",
  },
  "/reports/purchases": {
    title: "Purchase Report",
    description: "Procurement spending, supplier breakdown, and incoming goods analysis",
  },
};

export const menuGroups = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Cashier", path: "/cashier", icon: ShoppingCart },
    ],
  },
  {
    label: "MASTER DATA",
    items: [
      { label: "Products", path: "/products", icon: Package },
      { label: "Ingredients", path: "/ingredients", icon: Wheat },
      { label: "Categories", path: "/categories", icon: Tags },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Users", path: "/users", icon: Users },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { label: "Current Stock", path: "/stock", icon: Warehouse },
      {
        label: "Stock Movement",
        path: "/stock-movement",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "PURCHASES",
    items: [
      {
        label: "Purchase Orders",
        path: "/purchases",
        icon: FileSpreadsheet,
      },
    ],
  },
  {
    label: "SALES",
    items: [
      {
        label: "Transactions",
        path: "/transactions",
        icon: ReceiptText,
      },
      {
        label: "Cash Sessions",
        path: "/cash-sessions",
        icon: Banknote,
      },
    ],
  },
  {
    label: "REPORTS",
    items: [
      {
        label: "Sales",
        path: "/reports/sales",
        icon: TrendingUp,
      },
      {
        label: "Best Seller",
        path: "/reports/best-sellers",
        icon: Flame,
      },
      {
        label: "Inventory",
        path: "/reports/inventory",
        icon: Boxes,
      },
      {
        label: "Purchase",
        path: "/reports/purchases",
        icon: ShoppingBag,
      },
    ],
  },
];
