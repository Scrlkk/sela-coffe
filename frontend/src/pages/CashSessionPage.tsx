import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  Lock,
  Filter,
  Calendar,
} from "lucide-react";
import { CashSessionStats } from "@/components/cash-session/CashSessionStats";
import {
  CashSessionGridCard,
  CashSessionTableRow,
} from "@/components/cash-session/CashSessionViewItems";
import { OpenSessionDialog } from "@/components/cash-session/OpenSessionDialog";
import { CloseSessionDialog } from "@/components/cash-session/CloseSessionDialog";
import { SessionDetailDialog } from "@/components/cash-session/SessionDetailDialog";
import { EditSessionDialog } from "@/components/cash-session/EditSessionDialog";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { SortableTh } from "@/components/shared/SortableTh";
import { Pagination } from "@/components/shared/Pagination";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { formatRupiah } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import {
  type DateRangeFilter,
  DATE_RANGE_OPTIONS,
  isWithinDateRange,
} from "@/utils/formatDate";
import {
  cashSessionService,
  type ActiveCashSession,
  type SessionHistoryItem,
} from "@/services/cashSession";

const STATUS_OPTIONS = [
  { id: "ALL", label: "All Status" },
  { id: "active", label: "Live Shift" },
  { id: "completed", label: "Closed" },
];

export default function CashSessionPage() {

  const [activeSession, setActiveSession] = useState<ActiveCashSession | null>(
    () => cashSessionService.getActiveSession(),
  );
  const [history, setHistory] = useState<SessionHistoryItem[]>(() =>
    cashSessionService.getSessionHistory(),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [prevPage, setPrevPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedDetailSession, setSelectedDetailSession] =
    useState<SessionHistoryItem | null>(null);
  const [selectedEditSession, setSelectedEditSession] =
    useState<SessionHistoryItem | null>(null);

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_cash_session_view_mode",
    "table",
  );

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

  useEffect(() => {
    const sync = () => {
      setActiveSession(cashSessionService.getActiveSession());
      setHistory(cashSessionService.getSessionHistory());
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleOpenRegister = (floatAmount: number) => {
    const session = cashSessionService.openSession(floatAmount);
    setActiveSession(session);
    setHistory(cashSessionService.getSessionHistory());
    toast.success(
      `Register opened with ${formatRupiah(floatAmount)} opening float`,
    );
  };

  const handleCloseRegister = (actualCash: number, note?: string) => {
    const closed = cashSessionService.closeSession(actualCash, note);
    setActiveSession(null);
    setHistory(cashSessionService.getSessionHistory());
    if (closed) {
      if (closed.variance === 0) {
        toast.success("Register closed. Cash balanced perfectly!");
      } else if (closed.variance! > 0) {
        toast.info(
          `Register closed with cash surplus of +${formatRupiah(closed.variance!)}`,
        );
      } else {
        toast.warning(
          `Register closed with cash shortage of -${formatRupiah(Math.abs(closed.variance!))}`,
        );
      }
    }
  };

  const handleSaveEdit = (
    sessionId: string,
    updates: Partial<SessionHistoryItem>,
  ) => {
    const updated = cashSessionService.updateSession(sessionId, updates);
    setActiveSession(cashSessionService.getActiveSession());
    setHistory(cashSessionService.getSessionHistory());
    if (updated) {
      toast.success(`Session #${sessionId} updated successfully`);
    }
  };

  const filteredSessions = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim();

    return history.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(query) ||
        item.openedBy.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesDate = isWithinDateRange(item.openedAt, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [history, deferredSearch, statusFilter, dateFilter]);

  const {
    sortedItems: sortedSessions,
    sortConfig,
    requestSort,
  } = useTableSort(filteredSessions, "openedAt", "desc");

  const totalPages = Math.max(1, Math.ceil(sortedSessions.length / pageSize));
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSessions.slice(start, start + pageSize);
  }, [sortedSessions, currentPage, pageSize]);

  const isOpen = Boolean(activeSession?.isOpen);
  const expectedDrawerCash =
    (activeSession?.openingFloat ?? 0) + (activeSession?.cashSales ?? 0);

  return (
    <div className="w-full flex flex-col space-y-4">
      <CashSessionStats
        isOpen={isOpen}
        openingFloat={activeSession?.openingFloat ?? null}
        cashSalesToday={activeSession?.cashSales ?? 0}
        totalOrdersToday={activeSession?.totalOrders ?? 0}
      />

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs min-w-0">
        <div className="relative w-full xl:flex-1 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handlePageChange(1);
            }}
            placeholder="Search session ID or cashier name..."
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                handlePageChange(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto min-w-0">
            <div className="flex-1 sm:flex-none min-w-0">
              <FormDropdownPicker
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  handlePageChange(1);
                }}
                options={STATUS_OPTIONS}
                icon={Filter}
                className="w-full sm:w-40"
              />
            </div>

            <div className="flex-1 sm:flex-none min-w-0">
              <FormDropdownPicker
                value={dateFilter}
                onChange={(val) => {
                  setDateFilter(val as DateRangeFilter);
                  handlePageChange(1);
                }}
                options={DATE_RANGE_OPTIONS}
                icon={Calendar}
                className="w-full sm:w-44"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            {!isOpen ? (
              <Button
                onClick={() => setIsOpenDialogOpen(true)}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer gap-1.5 px-3.5"
              >
                <Plus className="w-4 h-4" />
                <span>Open Register</span>
              </Button>
            ) : (
              <Button
                onClick={() => setIsCloseDialogOpen(true)}
                variant="outline"
                className="h-9.5 rounded-xl border-border/80 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive text-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer gap-1.5 px-3.5"
              >
                <Lock className="w-4 h-4" />
                <span>Close Shift</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          "flex-1 min-w-0",
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {paginatedSessions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-sm font-bold text-foreground">
              No sessions found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="space-y-4 pb-6">
            <div
              key={`grid-page-${currentPage}`}
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5",
                slideClass,
              )}
            >
              {paginatedSessions.map((session) => (
                <CashSessionGridCard
                  key={session.id}
                  session={session}
                  onSelect={setSelectedDetailSession}
                  onEdit={setSelectedEditSession}
                />
              ))}
            </div>

            {sortedSessions.length > 0 && (
              <div className="flex justify-center pt-2 w-full">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedSessions.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      handlePageChange(1);
                    }}
                    pageSizeOptions={[10, 20, 50]}
                    itemLabel="sessions"
                    className="pt-0 pb-0"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pb-6">
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Session ID"
                          sortKey="id"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="whitespace-nowrap hidden lg:table-cell"
                        />
                        <SortableTh
                          label="Opened By"
                          sortKey="openedBy"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="whitespace-nowrap"
                        />
                        <SortableTh
                          label="Time Range"
                          sortKey="openedAt"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="whitespace-nowrap"
                        />
                        <SortableTh
                          label="Float"
                          sortKey="openingFloat"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                          className="whitespace-nowrap hidden xl:table-cell"
                        />
                        <SortableTh
                          label="Cash Sales"
                          sortKey="cashSales"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                          className="whitespace-nowrap hidden lg:table-cell"
                        />
                        <SortableTh
                          label="Expected"
                          sortKey="expectedCash"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                          className="whitespace-nowrap hidden md:table-cell"
                        />
                        <SortableTh
                          label="Variance"
                          sortKey="variance"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          align="right"
                          className="whitespace-nowrap"
                        />
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">
                          Action
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
                      {paginatedSessions.map((session) => (
                        <CashSessionTableRow
                          key={session.id}
                          session={session}
                          onSelect={setSelectedDetailSession}
                          onEdit={setSelectedEditSession}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {sortedSessions.length > 0 && (
                  <div className="pt-3 mt-1 border-t border-border/60">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={sortedSessions.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        handlePageChange(1);
                      }}
                      pageSizeOptions={[10, 20, 50]}
                      itemLabel="sessions"
                    />
                  </div>
                )}
              </Card>
            </div>

            <div className="sm:hidden space-y-3.5">
              <div
                key={`mobile-fallback-page-${currentPage}`}
                className={cn("grid grid-cols-1 gap-3.5", slideClass)}
              >
                {paginatedSessions.map((session) => (
                  <CashSessionGridCard
                    key={session.id}
                    session={session}
                    onSelect={setSelectedDetailSession}
                    onEdit={setSelectedEditSession}
                  />
                ))}
              </div>

              {sortedSessions.length > 0 && (
                <div className="flex justify-center pt-2 w-full">
                  <div className="bg-card/90 backdrop-blur-md rounded-2xl border border-border/70 shadow-xs px-3.5 sm:px-5 py-2.5 w-full sm:w-auto sm:min-w-120 max-w-2xl">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={sortedSessions.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        handlePageChange(1);
                      }}
                      pageSizeOptions={[10, 20, 50]}
                      itemLabel="sessions"
                      className="pt-0 pb-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <OpenSessionDialog
        isOpen={isOpenDialogOpen}
        onClose={() => setIsOpenDialogOpen(false)}
        onConfirmOpen={handleOpenRegister}
      />

      <CloseSessionDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        expectedCash={expectedDrawerCash}
        openingFloat={activeSession?.openingFloat ?? 0}
        cashSales={activeSession?.cashSales ?? 0}
        onConfirmClose={handleCloseRegister}
      />

      <SessionDetailDialog
        isOpen={Boolean(selectedDetailSession)}
        onClose={() => setSelectedDetailSession(null)}
        session={selectedDetailSession}
      />

      <EditSessionDialog
        isOpen={Boolean(selectedEditSession)}
        onClose={() => setSelectedEditSession(null)}
        session={selectedEditSession}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
