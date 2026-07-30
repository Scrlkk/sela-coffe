import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Truck,
  Users,
  Warehouse,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet,
  PackageCheck,
} from "lucide-react";

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
      {
        label: "Adjustment",
        path: "/stock-adjustment",
        icon: SlidersHorizontal,
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
      {
        label: "Receive Goods",
        path: "/purchases/receive",
        icon: PackageCheck,
      },
    ],
  },
  {
    label: "SALES",
    items: [
      {
        label: "Transactions",
        path: "/transactions",
        icon: ArrowLeftRight,
      },
      {
        label: "Cash Sessions",
        path: "/cash-sessions",
        icon: ShoppingCart,
      },
    ],
  },
];
