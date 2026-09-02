import React, { useState, useMemo, useEffect, useDeferredValue } from "react";
import {
  getStoredPurchaseOrders,
  addPurchaseOrder,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  softDeletePurchaseOrder,
  restorePurchaseOrder,
  type PurchaseOrderItem,
} from "@/services/purchase";
import {
  PurchaseOrderGridCard,
  PurchaseOrderTableRow,
  PurchaseOrderMobileCard,
} from "@/components/purchase/PurchaseOrderViewItems";
import { PurchaseOrderDrawer } from "@/components/purchase/PurchaseOrderDrawer";
import { PurchaseOrderDetailDrawer } from "@/components/purchase/PurchaseOrderDetailDrawer";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Trash2,
  FileSpreadsheet,
  PackageCheck,
  Clock,
  Filter,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type PurchaseDialogState =
  | { type: "create" }
  | { type: "detail"; po: PurchaseOrderItem }
  | { type: "cancel"; po: PurchaseOrderItem }
  | { type: "delete"; po: PurchaseOrderItem }
  | { type: "restore"; po: PurchaseOrderItem }
  | null;

export const PurchaseOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(() =>
    getStoredPurchaseOrders(true),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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
    "sela_purchase_view_mode",
  );

  const [dialog, setDialog] = useState<PurchaseDialogState>(null);

  useEffect(() => {
    const syncData = () => {
      setOrders(getStoredPurchaseOrders(true));
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("focus", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("focus", syncData);
    };
  }, []);

  const statusFilterOptions = [
    { id: "all", label: "All Status" },
    { id: "PENDING", label: "Pending" },
    { id: "RECEIVED", label: "Received" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => !o.isDeleted);
    const totalPurchases = activeOrders.reduce(
      (sum, o) => (o.status !== "CANCELLED" ? sum + o.total_amount : sum),
      0,
    );
    const pendingOrders = activeOrders.filter(
      (o) => o.status === "PENDING",
    ).length;
    const receivedOrders = activeOrders.filter(
      (o) => o.status === "RECEIVED",
    ).length;
    const archivedCount = orders.filter((o) => Boolean(o.isDeleted)).length;

    return {
      totalPurchases,
      pendingOrders,
      receivedOrders,
      archivedCount,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const targetList = orders.filter((o) =>
      showDeleted ? Boolean(o.isDeleted) : !o.isDeleted,
    );

    return targetList.filter((item) => {
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();

      const matchPo = item.po_number.toLowerCase().includes(q);
      const matchSupplier = item.supplier_name.toLowerCase().includes(q);
      const matchItem = item.items.some((i) =>
        i.ingredient_name.toLowerCase().includes(q),
      );

      return matchPo || matchSupplier || matchItem;
    });
  }, [orders, showDeleted, selectedStatus, deferredSearch]);

  const {
    sortedItems: sortedOrders,
    sortConfig,
    requestSort,
  } = useTableSort(filteredOrders, "order_date", "desc");

  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const handleSavePO = (
    poData: Omit<
      PurchaseOrderItem,
      "id" | "po_number" | "createdAt" | "updatedAt"
    >,
  ) => {
    const created = addPurchaseOrder(poData);
    setOrders(getStoredPurchaseOrders(true));
    toast.success(`Purchase order ${created.po_number} created successfully.`);
  };

  const handleDetailDrawerCancel = (po: PurchaseOrderItem) => {
    const ok = cancelPurchaseOrder(po.id);
    if (ok) {
      const refreshedList = getStoredPurchaseOrders(true);
      setOrders(refreshedList);
      const updatedPo = refreshedList.find((i) => i.id === po.id) || null;
      if (updatedPo) {
        setDialog({ type: "detail", po: updatedPo });
      }
      toast.success(`Purchase order ${po.po_number} cancelled.`);
    }
  };

  const handleDetailDrawerReceive = (po: PurchaseOrderItem) => {
    const receivedItems = po.items.map((i) => ({
      ingredient_id: i.ingredient_id,
      received_quantity: i.quantity,
    }));
    const success = receivePurchaseOrder(po.id, receivedItems);
    if (success) {
      const refreshedList = getStoredPurchaseOrders(true);
      setOrders(refreshedList);
      const updatedPo = refreshedList.find((i) => i.id === po.id) || null;
      if (updatedPo) {
        setDialog({ type: "detail", po: updatedPo });
      }
      toast.success("Goods received successfully! Stock has been updated.");
    } else {
      toast.error("Failed to receive goods.");
    }
  };

  const handleConfirmAction = () => {
    if (!dialog) return;

    if (dialog.type === "cancel") {
      const ok = cancelPurchaseOrder(dialog.po.id);
      if (ok) {
        setOrders(getStoredPurchaseOrders(true));
        toast.success(`Purchase order ${dialog.po.po_number} cancelled.`);
      }
    } else if (dialog.type === "delete") {
      softDeletePurchaseOrder(dialog.po.id);
      setOrders(getStoredPurchaseOrders(true));
      toast.success(`Purchase order ${dialog.po.po_number} moved to trash.`);
    } else if (dialog.type === "restore") {
      restorePurchaseOrder(dialog.po.id);
      setOrders(getStoredPurchaseOrders(true));
      toast.success(`Purchase order ${dialog.po.po_number} restored.`);
    }

    setDialog(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Purchases"
          value={formatRupiah(stats.totalPurchases)}
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Pending Deliveries"
          value={String(stats.pendingOrders)}
          badgeText={stats.pendingOrders > 0 ? "Awaiting Goods" : "All Arrived"}
          badgeVariant={stats.pendingOrders > 0 ? "danger" : "success"}
          icon={Clock}
        />
        <StatCard
          title="Received Orders"
          value={String(stats.receivedOrders)}
          badgeText="Stock Updated"
          badgeVariant="success"
          icon={PackageCheck}
        />
        <StatCard
          title="Trash / Archived"
          value={`${stats.archivedCount} Inactive`}
          badgeText={stats.archivedCount > 0 ? "Trash" : "Clean"}
          badgeVariant={stats.archivedCount > 0 ? "danger" : "neutral"}
          icon={Trash2}
        />
      </StatGrid>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, supplier, or items..."
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
          <div className="w-full sm:w-auto min-w-0">
            <FormDropdownPicker
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusFilterOptions}
              icon={Filter}
              className="w-full sm:w-48"
            />
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
              <span>{showDeleted ? "Active POs" : "Trash"}</span>
            </Button>

            {!showDeleted && (
              <Button
                onClick={() => setDialog({ type: "create" })}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer justify-center flex-1 sm:flex-none shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create PO</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <EmptyState
          title={showDeleted ? "Trash is empty" : "No purchase orders found"}
          description={
            showDeleted
              ? "There are no deleted purchase orders in the trash archive."
              : searchQuery || selectedStatus !== "all"
                ? "Try adjusting your search terms or clearing status filters."
                : "Start by creating your first purchase order for supplier raw materials."
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
            {paginatedOrders.map((po) => (
              <PurchaseOrderGridCard
                key={po.id}
                po={po}
                onDetail={(item) => setDialog({ type: "detail", po: item })}
                onDelete={(item) => setDialog({ type: "delete", po: item })}
                onRestore={(item) => setDialog({ type: "restore", po: item })}
              />
            ))}
          </div>

          {sortedOrders.length > 0 && (
            <div className="flex justify-center pt-2 w-full">
              <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedOrders.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    handlePageChange(1);
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  itemLabel="purchase orders"
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
                        label="PO Number"
                        sortKey="po_number"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="whitespace-nowrap py-2.5 px-3 hidden lg:table-cell"
                      />
                      <SortableTh
                        label="Supplier"
                        sortKey="supplier_name"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="py-2.5 px-3"
                      />
                      <SortableTh
                        label="Order Date"
                        sortKey="order_date"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        className="whitespace-nowrap py-2.5 px-3"
                      />
                      <th className="py-2.5 px-3 hidden lg:table-cell">
                        Ordered Materials
                      </th>
                      <SortableTh
                        label="Total Cost"
                        sortKey="total_amount"
                        sortConfig={sortConfig}
                        onSort={requestSort}
                        align="right"
                        className="whitespace-nowrap py-2.5 px-3"
                      />
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">
                        Status
                      </th>
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
                    {paginatedOrders.map((po) => (
                      <PurchaseOrderTableRow
                        key={po.id}
                        po={po}
                        onDetail={(item) =>
                          setDialog({ type: "detail", po: item })
                        }
                        onDelete={(item) =>
                          setDialog({ type: "delete", po: item })
                        }
                        onRestore={(item) =>
                          setDialog({ type: "restore", po: item })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedOrders.length > 0 && (
                <div className="pt-3 mt-1 border-t border-border/60">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedOrders.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="purchase orders"
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
              {paginatedOrders.map((po) => (
                <PurchaseOrderMobileCard
                  key={po.id}
                  po={po}
                  onDetail={(item) => setDialog({ type: "detail", po: item })}
                  onDelete={(item) => setDialog({ type: "delete", po: item })}
                  onRestore={(item) => setDialog({ type: "restore", po: item })}
                />
              ))}
            </div>

            {sortedOrders.length > 0 && (
              <div className="flex justify-center pt-2 w-full">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedOrders.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="purchase orders"
                    className="pt-0 pb-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PurchaseOrderDrawer
        isOpen={dialog?.type === "create"}
        onClose={() => setDialog(null)}
        onSave={handleSavePO}
      />

      <PurchaseOrderDetailDrawer
        isOpen={dialog?.type === "detail"}
        purchaseOrder={dialog?.type === "detail" ? dialog.po : null}
        onClose={() => setDialog(null)}
        onReceive={handleDetailDrawerReceive}
        onCancel={handleDetailDrawerCancel}
        onDelete={(po) => setDialog({ type: "delete", po })}
        onRestore={(po) => setDialog({ type: "restore", po })}
      />

      <ConfirmDialog
        isOpen={
          dialog?.type === "cancel" ||
          dialog?.type === "delete" ||
          dialog?.type === "restore"
        }
        onClose={() => setDialog(null)}
        onConfirm={handleConfirmAction}
        title={
          dialog?.type === "cancel"
            ? "Cancel Purchase Order"
            : dialog?.type === "delete"
              ? "Move to Trash"
              : "Restore Purchase Order"
        }
        subtitle={
          dialog && "po" in dialog
            ? `${dialog.po.po_number} • ${dialog.po.supplier_name}`
            : undefined
        }
        description={
          dialog?.type === "cancel"
            ? "Are you sure you want to cancel this purchase order? This status cannot be reversed."
            : dialog?.type === "delete"
              ? "Are you sure you want to move this purchase order to the trash archive?"
              : "Are you sure you want to restore this purchase order back to active records?"
        }
        confirmText={
          dialog?.type === "cancel"
            ? "Yes, Cancel Order"
            : dialog?.type === "delete"
              ? "Move to Trash"
              : "Restore PO"
        }
        variant={
          dialog?.type === "restore"
            ? "success"
            : dialog?.type === "cancel"
              ? "warning"
              : "destructive"
        }
      />
    </div>
  );
};

export default PurchaseOrderPage;
