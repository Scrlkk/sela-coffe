import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import {
  getStoredTransactions,
  softDeleteTransaction,
  restoreTransaction,
  type TransactionItem,
} from "@/services/transaction";
import {
  TransactionGridCard,
  TransactionTableRow,
  TransactionMobileCard,
} from "@/components/transaction/TransactionViewItems";
import { TransactionDetailDrawer } from "@/components/transaction/TransactionDetailDrawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Pagination } from "@/components/shared/Pagination";
import { formatRupiah } from "@/utils/formatCurrency";
import {
  DATE_RANGE_OPTIONS,
  isWithinDateRange,
  type DateRangeFilter,
} from "@/utils/formatDate";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  Trash2,
  ReceiptText,
  ShoppingBag,
  CreditCard,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type TransactionDialogState =
  | { type: "detail"; trx: TransactionItem }
  | { type: "delete"; trx: TransactionItem }
  | { type: "restore"; trx: TransactionItem }
  | null;

export const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>(() =>
    getStoredTransactions(true),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeFilter>("ALL");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [showDeleted, setShowDeleted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageChange = (newPage: number) => {
    setPrevPage(currentPage);
    setCurrentPage(newPage);
  };

  const slideClass = useMemo(() => {
    if (currentPage > prevPage) {
      return "animate-in fade-in-40 slide-in-from-right-6 duration-300 ease-out";
    }
    if (currentPage < prevPage) {
      return "animate-in fade-in-40 slide-in-from-left-6 duration-300 ease-out";
    }
    return "";
  }, [currentPage, prevPage]);

  const { viewMode, handleViewModeChange } = useViewMode(
    "sela_transaction_view_mode",
  );

  const [dialog, setDialog] = useState<TransactionDialogState>(null);

  useEffect(() => {
    const syncData = () => {
      setTransactions(getStoredTransactions(true));
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("focus", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("focus", syncData);
    };
  }, []);

  const paymentMethodOptions = [
    { id: "all", label: "All Methods" },
    { id: "cash", label: "Cash" },
    { id: "qris", label: "QRIS" },
    { id: "card", label: "Card" },
  ];

  const stats = useMemo(() => {
    const activeList = transactions.filter((t) => !t.isDeleted);
    const totalRevenue = activeList.reduce((sum, t) => sum + t.total_amount, 0);
    const totalOrders = activeList.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const nonCashCount = activeList.filter(
      (t) => t.payment_method === "qris" || t.payment_method === "card",
    ).length;
    const nonCashPercentage =
      totalOrders > 0 ? Math.round((nonCashCount / totalOrders) * 100) : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      nonCashPercentage,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const targetList = transactions.filter((t) =>
      showDeleted ? Boolean(t.isDeleted) : !t.isDeleted,
    );

    return targetList.filter((item) => {
      if (!isWithinDateRange(item.created_at, selectedDateRange)) {
        return false;
      }

      if (
        selectedPaymentMethod !== "all" &&
        item.payment_method !== selectedPaymentMethod
      ) {
        return false;
      }

      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();

      const matchInvoice = item.invoice_number.toLowerCase().includes(q);
      const matchCashier = item.cashier_name.toLowerCase().includes(q);
      const matchItem = item.items.some((i) =>
        i.product_name.toLowerCase().includes(q),
      );

      return matchInvoice || matchCashier || matchItem;
    });
  }, [
    transactions,
    showDeleted,
    selectedDateRange,
    selectedPaymentMethod,
    deferredSearch,
  ]);

  const {
    sortedItems: sortedTransactions,
    sortConfig,
    requestSort,
  } = useTableSort(filteredTransactions, "created_at", "desc");

  const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const handleConfirmAction = () => {
    if (!dialog) return;

    if (dialog.type === "delete") {
      softDeleteTransaction(dialog.trx.id);
      setTransactions(getStoredTransactions(true));
      toast.success(`Transaction ${dialog.trx.invoice_number} moved to trash.`);
    } else if (dialog.type === "restore") {
      restoreTransaction(dialog.trx.id);
      setTransactions(getStoredTransactions(true));
      toast.success(`Transaction ${dialog.trx.invoice_number} restored.`);
    }

    setDialog(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Revenue"
          value={formatRupiah(stats.totalRevenue)}
          icon={ReceiptText}
        />
        <StatCard
          title="Total Orders"
          value={String(stats.totalOrders)}
          badgeText="Recorded"
          badgeVariant="neutral"
          icon={ShoppingBag}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatRupiah(stats.avgOrderValue)}
          badgeText="AOV"
          badgeVariant="success"
          icon={TrendingUp}
        />
        <StatCard
          title="Non-Cash Ratio"
          value={`${stats.nonCashPercentage}%`}
          badgeText="QRIS & Card"
          badgeVariant="success"
          icon={CreditCard}
        />
      </StatGrid>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice #, cashier, or items..."
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto min-w-0">
            <div className="w-full sm:w-38 min-w-0">
              <FormDropdownPicker
                value={selectedDateRange}
                onChange={(val) => setSelectedDateRange(val as DateRangeFilter)}
                options={DATE_RANGE_OPTIONS}
                icon={Calendar}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-38 min-w-0">
              <FormDropdownPicker
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                options={paymentMethodOptions}
                icon={CreditCard}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
              className={cn(
                "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card justify-center flex-1 sm:flex-none shrink-0",
                showDeleted
                  ? "border-2 border-destructive text-destructive hover:border-destructive hover:bg-card shadow-xs font-bold"
                  : "border border-border/80 text-foreground hover:border-primary/80 hover:bg-card",
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeleted ? "Active Trx" : "Trash"}</span>
            </Button>
          </div>
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <EmptyState
          title={showDeleted ? "Trash is empty" : "No transactions found"}
          description={
            showDeleted
              ? "There are no deleted transactions in the trash archive."
              : searchQuery ||
                  selectedPaymentMethod !== "all" ||
                  selectedDateRange !== "ALL"
                ? "Try adjusting your search terms or resetting filter options."
                : "No sales transactions recorded yet."
          }
        />
      ) : viewMode === "grid" ? (
        <div className="space-y-4 pb-6">
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4",
              slideClass,
            )}
          >
            {paginatedTransactions.map((trx) => (
              <TransactionGridCard
                key={trx.id}
                transaction={trx}
                onDetail={(item) => setDialog({ type: "detail", trx: item })}
                onDelete={(item) => setDialog({ type: "delete", trx: item })}
                onRestore={(item) => setDialog({ type: "restore", trx: item })}
              />
            ))}
          </div>

          {sortedTransactions.length > 0 && (
            <div className="flex justify-center pt-2 w-full">
              <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedTransactions.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    handlePageChange(1);
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  itemLabel="transactions"
                  className="pt-0 pb-0"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pb-6 space-y-4">
          <div className="hidden sm:block">
            <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col justify-between overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                      <SortableTh
                        label="Invoice No"
                        sortKey="invoice_number"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="whitespace-nowrap py-2.5 px-3"
                      />
                      <SortableTh
                        label="Date & Time"
                        sortKey="created_at"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="whitespace-nowrap py-2.5 px-3"
                      />
                      <SortableTh
                        label="Cashier"
                        sortKey="cashier_name"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="py-2.5 px-3"
                      />
                      <th className="py-2.5 px-3 whitespace-nowrap">
                        Methods
                      </th>
                      <th className="py-2.5 px-3 hidden lg:table-cell">
                        Ordered Items
                      </th>
                      <SortableTh
                        label="Total Amount"
                        sortKey="total_amount"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        align="right"
                        className="whitespace-nowrap py-2.5 px-3"
                      />
                      <th className="py-2.5 px-3 text-right whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    key={`table-page-${currentPage}`}
                    className={cn(
                      "divide-y divide-border/40 font-medium",
                      slideClass,
                    )}
                  >
                    {paginatedTransactions.map((trx) => (
                      <TransactionTableRow
                        key={trx.id}
                        transaction={trx}
                        onDetail={(item) =>
                          setDialog({ type: "detail", trx: item })
                        }
                        onDelete={(item) =>
                          setDialog({ type: "delete", trx: item })
                        }
                        onRestore={(item) =>
                          setDialog({ type: "restore", trx: item })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedTransactions.length > 0 && (
                <div className="pt-3 mt-1 border-t border-border/60">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedTransactions.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="transactions"
                  />
                </div>
              )}
            </Card>
          </div>

          <div className="block sm:hidden space-y-3">
            <div
              key={`mobile-page-${currentPage}`}
              className={cn("space-y-2.5", slideClass)}
            >
              {paginatedTransactions.map((trx) => (
                <TransactionMobileCard
                  key={trx.id}
                  transaction={trx}
                  onDetail={(item) => setDialog({ type: "detail", trx: item })}
                  onDelete={(item) => setDialog({ type: "delete", trx: item })}
                  onRestore={(item) =>
                    setDialog({ type: "restore", trx: item })
                  }
                />
              ))}
            </div>

            {sortedTransactions.length > 0 && (
              <div className="flex justify-center pt-2 w-full">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedTransactions.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="transactions"
                    className="pt-0 pb-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <TransactionDetailDrawer
        isOpen={dialog?.type === "detail"}
        transaction={dialog?.type === "detail" ? dialog.trx : null}
        onClose={() => setDialog(null)}
        onDelete={(trx) => setDialog({ type: "delete", trx })}
        onRestore={(trx) => setDialog({ type: "restore", trx })}
      />

      <ConfirmDialog
        isOpen={dialog?.type === "delete" || dialog?.type === "restore"}
        onClose={() => setDialog(null)}
        onConfirm={handleConfirmAction}
        title={
          dialog?.type === "delete"
            ? "Move to Trash"
            : "Restore Transaction"
        }
        subtitle={
          dialog && "trx" in dialog
            ? `${dialog.trx.invoice_number} • ${formatRupiah(dialog.trx.total_amount)}`
            : undefined
        }
        description={
          dialog?.type === "delete"
            ? "Are you sure you want to move this transaction to the trash archive?"
            : "Are you sure you want to restore this transaction back to active records?"
        }
        confirmText={
          dialog?.type === "delete"
            ? "Move to Trash"
            : "Restore Transaction"
        }
        variant={dialog?.type === "restore" ? "success" : "destructive"}
      />
    </div>
  );
};

export default TransactionPage;
