
import { getStoredTransactions } from "./transaction";
import { getStoredProducts } from "./product";
import { getStoredIngredients } from "./ingredient";
import { getStoredPurchaseOrders, type PurchaseOrderItem } from "./purchase";
import { getStoredCategories } from "./category";
import { getStoredSuppliers } from "./supplier";
import { getStoredStockLogs } from "./stock";

export type DateRangeFilter =
  | "today"
  | "this_week"
  | "last_7_days"
  | "this_month"
  | "last_month"
  | "all_time";

export interface DateRange {
  start: Date;
  end: Date;
}

export const REPORT_PERIOD_OPTIONS: {
  label: string;
  value: DateRangeFilter;
}[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "All Time", value: "all_time" },
];

export const getDateRange = (period: DateRangeFilter): DateRange => {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  switch (period) {
    case "today": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      return { start, end };
    }
    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        diff,
        0,
        0,
        0,
        0,
      );
      return { start, end };
    }
    case "last_7_days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start, end };
    }
    case "last_month": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );
      const lastMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end: lastMonthEnd };
    }
    case "all_time":
    default: {
      return { start: new Date(0), end: new Date(8640000000000000) };
    }
  }
};

const isDateInRange = (dateStr: string, range: DateRange): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= range.start && d <= range.end;
};

export const REPORT_PALETTE = [
  "#6b2f0a",
  "#c68a4c",
  "#647a38",
  "#b44a3a",
  "#d97706",
  "#0284c7",
  "#8b5cf6",
  "#64748b",
];

export interface RevenueTrendPoint {
  label: string;
  dateKey: string;
  revenue: number;
  ordersCount: number;
  cashAmount: number;
  nonCashAmount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
  color: string;
}

export interface DailySalesSummary {
  date: string;
  formattedDate: string;
  orders: number;
  cash: number;
  qris: number;
  card: number;
  total: number;
}

export interface SalesReportData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    nonCashRatio: number;
  };
  revenueTrend: RevenueTrendPoint[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  salesSummaryTable: DailySalesSummary[];
}

export const getSalesReportData = (
  period: DateRangeFilter = "all_time",
): SalesReportData => {
  try {
    const range = getDateRange(period);
    const allTransactions = getStoredTransactions(false);

    const transactions = allTransactions.filter(
      (t) =>
        t.status === "paid" &&
        !t.isDeleted &&
        isDateInRange(t.created_at, range),
    );

    let totalRevenue = 0;
    let cashTotal = 0;
    let qrisTotal = 0;
    let cardTotal = 0;
    let cashCount = 0;
    let qrisCount = 0;
    let cardCount = 0;

    const dateMap = new Map<
      string,
      {
        orders: number;
        cash: number;
        qris: number;
        card: number;
        total: number;
      }
    >();

    transactions.forEach((t) => {
      const amount = Number(t.total_amount) || 0;
      totalRevenue += amount;

      const method = (t.payment_method || "cash").toLowerCase();
      if (method === "qris") {
        qrisTotal += amount;
        qrisCount += 1;
      } else if (method === "card") {
        cardTotal += amount;
        cardCount += 1;
      } else {
        cashTotal += amount;
        cashCount += 1;
      }

      const dateKey = (t.created_at || "").slice(0, 10) || "Unknown";
      const existing = dateMap.get(dateKey) || {
        orders: 0,
        cash: 0,
        qris: 0,
        card: 0,
        total: 0,
      };
      existing.orders += 1;
      existing.total += amount;
      if (method === "qris") existing.qris += amount;
      else if (method === "card") existing.card += amount;
      else existing.cash += amount;
      dateMap.set(dateKey, existing);
    });

    const totalOrders = transactions.length;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const nonCashTotal = qrisTotal + cardTotal;
    const nonCashRatio =
      totalRevenue > 0 ? Math.round((nonCashTotal / totalRevenue) * 100) : 0;

    const paymentMethods: PaymentMethodBreakdown[] = [
      {
        method: "cash",
        label: "Cash",
        count: cashCount,
        totalAmount: cashTotal,
        percentage:
          totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0,
        color: "#6b2f0a",
      },
      {
        method: "qris",
        label: "QRIS",
        count: qrisCount,
        totalAmount: qrisTotal,
        percentage:
          totalRevenue > 0 ? Math.round((qrisTotal / totalRevenue) * 100) : 0,
        color: "#c68a4c",
      },
      {
        method: "card",
        label: "Debit / Card",
        count: cardCount,
        totalAmount: cardTotal,
        percentage:
          totalRevenue > 0 ? Math.round((cardTotal / totalRevenue) * 100) : 0,
        color: "#647a38",
      },
    ];

    const sortedDates = Array.from(dateMap.keys()).sort();
    const isToday = period === "today";
    let revenueTrend: RevenueTrendPoint[] = [];

    if (isToday) {
      const hourMap = new Map<
        number,
        {
          orders: number;
          cash: number;
          qris: number;
          card: number;
          total: number;
        }
      >();
      const recordedHours: number[] = [];

      transactions.forEach((t) => {
        let h = 9;
        try {
          const d = new Date(t.created_at);
          if (!isNaN(d.getTime())) {
            h = d.getHours();
          }
        } catch {
          // fallback
        }
        recordedHours.push(h);
        const existing = hourMap.get(h) || {
          orders: 0,
          cash: 0,
          qris: 0,
          card: 0,
          total: 0,
        };
        const amount = Number(t.total_amount) || 0;
        const method = (t.payment_method || "cash").toLowerCase();
        existing.orders += 1;
        existing.total += amount;
        if (method === "qris") existing.qris += amount;
        else if (method === "card") existing.card += amount;
        else existing.cash += amount;
        hourMap.set(h, existing);
      });

      const currentHour = new Date().getHours();
      const minHour =
        recordedHours.length > 0
          ? Math.min(...recordedHours)
          : Math.max(0, currentHour - 4);
      const maxHour =
        recordedHours.length > 0
          ? Math.max(Math.max(...recordedHours), currentHour)
          : Math.max(currentHour, minHour + 4);

      const startHour = Math.max(0, minHour);
      const endHour = Math.min(23, maxHour);

      for (let h = startHour; h <= endHour; h++) {
        const data = hourMap.get(h) || {
          orders: 0,
          cash: 0,
          qris: 0,
          card: 0,
          total: 0,
        };
        const formattedHour = `${h.toString().padStart(2, "0")}:00`;
        revenueTrend.push({
          label: formattedHour,
          dateKey: formattedHour,
          revenue: data.total,
          ordersCount: data.orders,
          cashAmount: data.cash,
          nonCashAmount: data.qris + data.card,
        });
      }
    } else {
      revenueTrend = sortedDates.map((dKey) => {
        const data = dateMap.get(dKey)!;
        let label = dKey;
        try {
          const parsed = new Date(dKey);
          if (!isNaN(parsed.getTime())) {
            label = parsed.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            });
          }
        } catch {
          // fallback
        }
        return {
          label,
          dateKey: dKey,
          revenue: data.total,
          ordersCount: data.orders,
          cashAmount: data.cash,
          nonCashAmount: data.qris + data.card,
        };
      });

      if (revenueTrend.length === 0) {
        revenueTrend.push({
          label: "Today",
          dateKey: new Date().toISOString().slice(0, 10),
          revenue: 0,
          ordersCount: 0,
          cashAmount: 0,
          nonCashAmount: 0,
        });
      }
    }

    const salesSummaryTable: DailySalesSummary[] = sortedDates
      .map((dKey) => {
        const data = dateMap.get(dKey)!;
        let formattedDate = dKey;
        try {
          const parsed = new Date(dKey);
          if (!isNaN(parsed.getTime())) {
            formattedDate = parsed.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        } catch {
          // fallback
        }
        return {
          date: dKey,
          formattedDate,
          orders: data.orders,
          cash: data.cash,
          qris: data.qris,
          card: data.card,
          total: data.total,
        };
      })
      .reverse();

    return {
      stats: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        nonCashRatio,
      },
      revenueTrend,
      paymentMethodBreakdown: paymentMethods,
      salesSummaryTable,
    };
  } catch (err) {
    console.error("Error generating sales report data:", err);
    return {
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        nonCashRatio: 0,
      },
      revenueTrend: [],
      paymentMethodBreakdown: [],
      salesSummaryTable: [],
    };
  }
};

export interface BestSellerRankItem {
  rank: number;
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  totalRevenue: number;
  percentageContribution: number;
}

export interface CategorySalesContribution {
  category: string;
  quantity: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface BestSellerReportData {
  stats: {
    topProduct: string;
    totalUnitsSold: number;
    bestSellerRevenue: number;
    topCategory: string;
  };
  leaderboard: BestSellerRankItem[];
  categorySales: CategorySalesContribution[];
}

export const getBestSellerReportData = (
  period: DateRangeFilter = "all_time",
  categoryFilter?: string,
): BestSellerReportData => {
  try {
    const range = getDateRange(period);
    const transactions = getStoredTransactions(false).filter(
      (t) =>
        t.status === "paid" &&
        !t.isDeleted &&
        isDateInRange(t.created_at, range),
    );
    const products = getStoredProducts(false);
    const categories = getStoredCategories(false, "product");
    const categoryNameMap = new Map<string, string>();
    categories.forEach((c) => {
      categoryNameMap.set(c.id, c.name);
      categoryNameMap.set(c.id.toLowerCase(), c.name);
      categoryNameMap.set(c.name.toLowerCase(), c.name);
    });

    const productCategoryMap = new Map<string, string>();
    products.forEach((p) => productCategoryMap.set(p.name, p.category));

    const itemMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        unitsSold: number;
        revenue: number;
      }
    >();
    const categoryMap = new Map<
      string,
      { quantity: number; revenue: number }
    >();

    let totalUnitsAll = 0;
    let totalRevenueAll = 0;

    transactions.forEach((t) => {
      (t.items || []).forEach((line) => {
        const pName = line.product_name || "Unknown Item";
        const rawCat = productCategoryMap.get(pName) || "other";
        const catName =
          categoryNameMap.get(rawCat.toLowerCase()) ||
          categoryNameMap.get(rawCat) ||
          rawCat;
        const qty = Number(line.quantity) || 0;
        const subtotal =
          Number(line.subtotal) || qty * (Number(line.price) || 0);

        totalUnitsAll += qty;
        totalRevenueAll += subtotal;

        if (
          categoryFilter &&
          categoryFilter !== "all" &&
          rawCat.toLowerCase() !== categoryFilter.toLowerCase() &&
          catName.toLowerCase() !== categoryFilter.toLowerCase()
        ) {
          return;
        }

        const existing = itemMap.get(pName) || {
          id: line.product_id || pName,
          name: pName,
          category: catName,
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += qty;
        existing.revenue += subtotal;
        itemMap.set(pName, existing);

        const catExisting = categoryMap.get(catName) || {
          quantity: 0,
          revenue: 0,
        };
        catExisting.quantity += qty;
        catExisting.revenue += subtotal;
        categoryMap.set(catName, catExisting);
      });
    });

    const sortedItems = Array.from(itemMap.values()).sort(
      (a, b) => b.unitsSold - a.unitsSold,
    );

    const leaderboard: BestSellerRankItem[] = sortedItems
      .slice(0, 10)
      .map((item, idx) => ({
        rank: idx + 1,
        id: item.id,
        name: item.name,
        category: item.category,
        unitsSold: item.unitsSold,
        totalRevenue: item.revenue,
        percentageContribution:
          totalRevenueAll > 0
            ? Math.round((item.revenue / totalRevenueAll) * 100)
            : 0,
      }));

    let colorIdx = 0;
    const categorySales: CategorySalesContribution[] = Array.from(
      categoryMap.entries(),
    )
      .map(([cat, val]) => ({
        category: cat,
        quantity: val.quantity,
        revenue: val.revenue,
        percentage:
          totalUnitsAll > 0
            ? Math.round((val.quantity / totalUnitsAll) * 100)
            : 0,
        color: REPORT_PALETTE[colorIdx++ % REPORT_PALETTE.length],
      }))
      .sort((a, b) => b.quantity - a.quantity);

    const topProduct = leaderboard[0]?.name || "N/A";
    const bestSellerRevenue = leaderboard[0]?.totalRevenue || 0;
    const topCategory = categorySales[0]?.category || "N/A";

    return {
      stats: {
        topProduct,
        totalUnitsSold: totalUnitsAll,
        bestSellerRevenue,
        topCategory,
      },
      leaderboard,
      categorySales,
    };
  } catch (err) {
    console.error("Error generating best seller report:", err);
    return {
      stats: {
        topProduct: "N/A",
        totalUnitsSold: 0,
        bestSellerRevenue: 0,
        topCategory: "N/A",
      },
      leaderboard: [],
      categorySales: [],
    };
  }
};

export interface StockHealthItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPrice: number;
  valuation: number;
  status: "Safe" | "Low Stock" | "Critical";
  statusColor: string;
  percentageFill: number;
  estimatedDaysRemaining: number;
}

export interface CategoryValuationBreakdown {
  category: string;
  categoryName: string;
  itemsCount: number;
  totalValuation: number;
  percentage: number;
  color: string;
}

export interface InventoryReportData {
  stats: {
    totalItems: number;
    totalValuation: number;
    lowStockCount: number;
    topCategory: string;
    topCategoryPercentage: number;
  };
  categoryValuation: CategoryValuationBreakdown[];
  stockHealthList: StockHealthItem[];
}

export const getInventoryReportData = (
  period: DateRangeFilter = "all_time",
  categoryFilter?: string,
  statusFilter?:
    | "all"
    | "Safe"
    | "Low Stock"
    | "Critical"
    | "Aman"
    | "Menipis"
    | "Kritis",
): InventoryReportData => {
  try {
    const ingredients = getStoredIngredients(false);
    const categories = getStoredCategories(false, "ingredient");
    const categoryNameMap = new Map<string, string>();
    categories.forEach((c) => categoryNameMap.set(c.id, c.name));

    const stockLogs = getStoredStockLogs();
    const range = getDateRange(period);

    const consumptionMap = new Map<string, number>();
    stockLogs.forEach((log) => {
      if (log.type === "out" && isDateInRange(log.created_at, range)) {
        const qty = Math.abs(log.quantity || 0);
        consumptionMap.set(
          log.product_id,
          (consumptionMap.get(log.product_id) || 0) + qty,
        );
      }
    });

    let totalValuation = 0;
    let lowStockCount = 0;
    const catValMap = new Map<
      string,
      { count: number; totalValuation: number }
    >();
    const healthList: StockHealthItem[] = [];

    ingredients.forEach((ing) => {
      const catKey = ing.category || "uncategorized";
      const catName = categoryNameMap.get(catKey) || catKey;
      const current = ing.currentStock ?? 0;
      const min = ing.minStock ?? 50;
      const max =
        ing.maxStock && ing.maxStock > 0
          ? ing.maxStock
          : Math.max(min * 3, 500);
      const cost = ing.costPrice || 0;
      const valuation = current * cost;

      totalValuation += valuation;

      let status: "Safe" | "Low Stock" | "Critical" = "Safe";
      let statusColor =
        "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
      if (current <= min * 0.5) {
        status = "Critical";
        statusColor = "text-red-600 bg-red-500/10 border-red-500/20";
        lowStockCount += 1;
      } else if (current <= min) {
        status = "Low Stock";
        statusColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";
        lowStockCount += 1;
      }

      const weeklyUsage = consumptionMap.get(ing.id) || current * 0.15 || 5;
      const dailyUsage = Math.max(0.1, weeklyUsage / 7);
      const estimatedDaysRemaining = Math.max(
        1,
        Math.round(current / dailyUsage),
      );
      const percentageFill = Math.min(100, Math.round((current / max) * 100));

      const existingCat = catValMap.get(catKey) || {
        count: 0,
        totalValuation: 0,
      };
      existingCat.count += 1;
      existingCat.totalValuation += valuation;
      catValMap.set(catKey, existingCat);

      healthList.push({
        id: ing.id,
        name: ing.name,
        category: catName,
        unit: ing.unit,
        currentStock: current,
        minStock: min,
        maxStock: max,
        costPrice: cost,
        valuation,
        status,
        statusColor,
        percentageFill,
        estimatedDaysRemaining,
      });
    });

    let colorIdx = 0;
    const categoryValuation: CategoryValuationBreakdown[] = Array.from(
      catValMap.entries(),
    ).map(([catKey, val]) => ({
      category: catKey,
      categoryName: categoryNameMap.get(catKey) || catKey,
      itemsCount: val.count,
      totalValuation: val.totalValuation,
      percentage:
        totalValuation > 0
          ? Math.round((val.totalValuation / totalValuation) * 100)
          : 0,
      color: REPORT_PALETTE[colorIdx++ % REPORT_PALETTE.length],
    }));

    const filteredList = healthList.filter((item) => {
      if (
        categoryFilter &&
        categoryFilter !== "all" &&
        item.category.toLowerCase() !== categoryFilter.toLowerCase()
      ) {
        return false;
      }
      if (statusFilter && statusFilter !== "all") {
        if (statusFilter === "Aman" && item.status !== "Safe") return false;
        if (statusFilter === "Menipis" && item.status !== "Low Stock")
          return false;
        if (statusFilter === "Kritis" && item.status !== "Critical")
          return false;
        if (
          ["Safe", "Low Stock", "Critical"].includes(statusFilter) &&
          item.status !== statusFilter
        ) {
          return false;
        }
      }
      return true;
    });

    const sortedCatVal = [...categoryValuation].sort(
      (a, b) => b.totalValuation - a.totalValuation,
    );
    const topCategory = sortedCatVal[0]?.categoryName || "N/A";
    const topCategoryPercentage = sortedCatVal[0]?.percentage || 0;

    return {
      stats: {
        totalItems: ingredients.length,
        totalValuation,
        lowStockCount,
        topCategory,
        topCategoryPercentage,
      },
      categoryValuation,
      stockHealthList: filteredList,
    };
  } catch (err) {
    console.error("Error generating inventory report:", err);
    return {
      stats: {
        totalItems: 0,
        totalValuation: 0,
        lowStockCount: 0,
        topCategory: "N/A",
        topCategoryPercentage: 0,
      },
      categoryValuation: [],
      stockHealthList: [],
    };
  }
};

export interface PurchaseSpendTrendPoint {
  label: string;
  dateKey: string;
  spend: number;
  ordersCount: number;
}

export interface SupplierSpendShare {
  supplierId: string;
  supplierName: string;
  totalSpend: number;
  ordersCount: number;
  percentage: number;
  color: string;
}

export interface PurchaseReportData {
  stats: {
    totalSpend: number;
    totalOrders: number;
    activeSuppliersCount: number;
    pendingDeliveries: number;
  };
  spendTrend: PurchaseSpendTrendPoint[];
  supplierSpendShare: SupplierSpendShare[];
  recentPurchaseOrders: PurchaseOrderItem[];
}

export const getPurchaseReportData = (
  period: DateRangeFilter = "all_time",
  supplierFilter?: string,
): PurchaseReportData => {
  try {
    const range = getDateRange(period);
    const allPurchases = getStoredPurchaseOrders(false);
    const allSuppliers = getStoredSuppliers(false);

    const filteredPurchases = allPurchases.filter((p) => {
      if (p.isDeleted) return false;
      if (!isDateInRange(p.order_date || p.createdAt, range)) return false;
      if (
        supplierFilter &&
        supplierFilter !== "all" &&
        p.supplier_id !== supplierFilter &&
        p.supplier_name !== supplierFilter
      ) {
        return false;
      }
      return true;
    });

    let totalSpend = 0;
    let pendingDeliveries = 0;
    const activeSupplierIds = new Set<string>();
    const supplierMap = new Map<
      string,
      { name: string; spend: number; count: number }
    >();
    const dateMap = new Map<string, { spend: number; orders: number }>();

    filteredPurchases.forEach((po) => {
      const amount = Number(po.total_amount) || 0;
      if (po.status !== "CANCELLED") {
        totalSpend += amount;
      }
      if (po.status === "PENDING") {
        pendingDeliveries += 1;
      }
      if (po.supplier_id) {
        activeSupplierIds.add(po.supplier_id);
      }

      const supName = po.supplier_name || "Vendor";
      const sExisting = supplierMap.get(po.supplier_id || supName) || {
        name: supName,
        spend: 0,
        count: 0,
      };
      if (po.status !== "CANCELLED") {
        sExisting.spend += amount;
      }
      sExisting.count += 1;
      supplierMap.set(po.supplier_id || supName, sExisting);

      const dateKey =
        (po.order_date || po.createdAt || "").slice(0, 10) || "Unknown";
      const dExisting = dateMap.get(dateKey) || { spend: 0, orders: 0 };
      if (po.status !== "CANCELLED") {
        dExisting.spend += amount;
      }
      dExisting.orders += 1;
      dateMap.set(dateKey, dExisting);
    });

    const isToday = period === "today";
    let spendTrend: PurchaseSpendTrendPoint[] = [];

    if (isToday) {
      const hourMap = new Map<number, { spend: number; orders: number }>();
      const recordedHours: number[] = [];

      filteredPurchases.forEach((po) => {
        let h = 9;
        try {
          const d = new Date(po.order_date || po.createdAt);
          if (!isNaN(d.getTime())) {
            h = d.getHours();
          }
        } catch {
          // fallback
        }
        recordedHours.push(h);
        const existing = hourMap.get(h) || { spend: 0, orders: 0 };
        const amount = Number(po.total_amount) || 0;
        if (po.status !== "CANCELLED") {
          existing.spend += amount;
        }
        existing.orders += 1;
        hourMap.set(h, existing);
      });

      const currentHour = new Date().getHours();
      const minHour =
        recordedHours.length > 0
          ? Math.min(...recordedHours)
          : Math.max(0, currentHour - 4);
      const maxHour =
        recordedHours.length > 0
          ? Math.max(Math.max(...recordedHours), currentHour)
          : Math.max(currentHour, minHour + 4);

      const startHour = Math.max(0, minHour);
      const endHour = Math.min(23, maxHour);

      for (let h = startHour; h <= endHour; h++) {
        const data = hourMap.get(h) || { spend: 0, orders: 0 };
        const formattedHour = `${h.toString().padStart(2, "0")}:00`;
        spendTrend.push({
          label: formattedHour,
          dateKey: formattedHour,
          spend: data.spend,
          ordersCount: data.orders,
        });
      }
    } else {
      const sortedDates = Array.from(dateMap.keys()).sort();
      spendTrend = sortedDates.map((dKey) => {
        const data = dateMap.get(dKey)!;
        let label = dKey;
        try {
          const parsed = new Date(dKey);
          if (!isNaN(parsed.getTime())) {
            label = parsed.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            });
          }
        } catch {
          // fallback
        }
        return {
          label,
          dateKey: dKey,
          spend: data.spend,
          ordersCount: data.orders,
        };
      });

      if (spendTrend.length === 0) {
        spendTrend.push({
          label: "Today",
          dateKey: new Date().toISOString().slice(0, 10),
          spend: 0,
          ordersCount: 0,
        });
      }
    }

    let colorIdx = 0;
    const supplierSpendShare: SupplierSpendShare[] = Array.from(
      supplierMap.entries(),
    )
      .map(([sId, val]) => ({
        supplierId: sId,
        supplierName: val.name,
        totalSpend: val.spend,
        ordersCount: val.count,
        percentage:
          totalSpend > 0 ? Math.round((val.spend / totalSpend) * 100) : 0,
        color: REPORT_PALETTE[colorIdx++ % REPORT_PALETTE.length],
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);

    return {
      stats: {
        totalSpend,
        totalOrders: filteredPurchases.length,
        activeSuppliersCount: activeSupplierIds.size || allSuppliers.length,
        pendingDeliveries,
      },
      spendTrend,
      supplierSpendShare,
      recentPurchaseOrders: filteredPurchases.sort((a, b) =>
        (b.order_date || b.createdAt).localeCompare(
          a.order_date || a.createdAt,
        ),
      ),
    };
  } catch (err) {
    console.error("Error generating purchase report:", err);
    return {
      stats: {
        totalSpend: 0,
        totalOrders: 0,
        activeSuppliersCount: 0,
        pendingDeliveries: 0,
      },
      spendTrend: [],
      supplierSpendShare: [],
      recentPurchaseOrders: [],
    };
  }
};
