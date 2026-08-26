import React, { useState, useMemo, useDeferredValue } from "react";
import type { SupplierItem } from "@/services/supplier";
import {
  getStoredSuppliers,
  addSupplier,
  updateSupplier,
  softDeleteSupplier,
  restoreSupplier,
} from "@/services/supplier";
import { SupplierDialog } from "@/components/supplier/SupplierDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Truck,
  User,
  Phone,
  MapPin,
  RotateCcw,
  Building2,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";
import { formatWhatsAppUrl } from "@/utils/formatString";

const getStoreLabel = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "Store Link";
  }
};

type SupplierDialogState =
  | { type: "create" }
  | { type: "edit"; supplier: SupplierItem }
  | { type: "delete"; supplier: SupplierItem }
  | { type: "restore"; supplier: SupplierItem }
  | null;

export const SupplierPage: React.FC = () => {
  const [allSuppliers, setAllSuppliers] = useState<SupplierItem[]>(() =>
    getStoredSuppliers(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_supplier_view_mode",
    "table",
  );

  const [dialog, setDialog] = useState<SupplierDialogState>(null);

  const stats = useMemo(() => {
    const active = allSuppliers.filter((s) => !s.isDeleted);
    const deleted = allSuppliers.filter((s) => s.isDeleted);
    const withLinkCount = active.filter(
      (s) => s.link && s.link.trim().length > 0,
    ).length;

    return {
      totalActive: active.length,
      totalDeleted: deleted.length,
      withLinkCount,
    };
  }, [allSuppliers]);

  const filteredSuppliers = useMemo(() => {
    return allSuppliers.filter((s) => {
      const isStateMatch = showDeleted ? Boolean(s.isDeleted) : !s.isDeleted;
      if (!isStateMatch) return false;

      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.link && s.link.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  }, [allSuppliers, showDeleted, deferredSearch]);

  const {
    sortedItems: displayedSuppliers,
    sortConfig,
    requestSort,
  } = useTableSort(filteredSuppliers, "name", "asc");

  const handleCreate = (data: Omit<SupplierItem, "id">) => {
    const created = addSupplier(data);
    setAllSuppliers(getStoredSuppliers(true));
    toast.success(`Supplier "${created.name}" added successfully`);
  };

  const handleUpdate = (id: string, data: Omit<SupplierItem, "id">) => {
    const updated = updateSupplier(id, data);
    if (updated) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${updated.name}" updated successfully`);
    }
  };

  const handleDelete = (supplier: SupplierItem) => {
    const success = softDeleteSupplier(supplier.id);
    if (success) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${supplier.name}" archived`);
    }
  };

  const handleRestore = (supplier: SupplierItem) => {
    const success = restoreSupplier(supplier.id);
    if (success) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${supplier.name}" restored`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Suppliers"
          value={`${stats.totalActive} Partners`}
          icon={Truck}
        />
        <StatCard
          title="Contact Persons"
          value={`${stats.totalActive} Reps`}
          badgeText="Direct Contact"
          badgeVariant="neutral"
          icon={User}
        />
        <StatCard
          title="Online Stores"
          value={`${stats.withLinkCount} Linked`}
          badgeText="E-Commerce"
          badgeVariant="success"
          icon={Globe}
        />
        <StatCard
          title="Trash / Deleted"
          value={`${stats.totalDeleted} Inactive`}
          badgeText={stats.totalDeleted > 0 ? "Trash" : "Clean"}
          badgeVariant={stats.totalDeleted > 0 ? "danger" : "neutral"}
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
            placeholder={
              showDeleted
                ? "Search deleted suppliers..."
                : "Search supplier name, contact person, phone, store link..."
            }
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full xl:w-auto min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <ViewModeSwitcher
              value={viewMode}
              onChange={handleViewModeChange}
            />

            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
              className={cn(
                "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card",
                showDeleted
                  ? "border-2 border-destructive text-destructive hover:border-destructive hover:bg-card shadow-xs font-bold"
                  : "border border-border/80 text-foreground hover:border-primary/80 hover:bg-card",
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeleted ? "Active Suppliers" : "Trash"}</span>
              {stats.totalDeleted > 0 && !showDeleted && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>
          </div>

          {!showDeleted && (
            <Button
              onClick={() => setDialog({ type: "create" })}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </Button>
          )}
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {displayedSuppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description={
              searchQuery
                ? "No supplier matches your search filters."
                : showDeleted
                  ? "Deleted suppliers trash is currently empty."
                  : "No suppliers registered yet. Click Add Supplier to register your partners."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 pt-1 pb-6">
            {displayedSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-foreground text-sm truncate">
                            {supplier.name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {supplier.contactPerson}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a
                        href={formatWhatsAppUrl(supplier.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground hover:underline truncate"
                      >
                        {supplier.phone}
                      </a>
                    </div>
                    {supplier.link && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                        <a
                          href={
                            supplier.link.startsWith("http")
                              ? supplier.link
                              : `https://${supplier.link}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">
                            {getStoreLabel(supplier.link)}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                    {supplier.isDeleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDialog({ type: "restore", supplier })}
                        className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Supplier</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDialog({ type: "edit", supplier })}
                          className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDialog({ type: "delete", supplier })}
                          className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Supplier / Partner"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <SortableTh
                          label="Contact Person"
                          sortKey="contactPerson"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                        />
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Store Link</th>
                        <th className="py-2.5 px-3 hidden xl:table-cell">
                          Address
                        </th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedSuppliers.map((supplier) => (
                        <tr
                          key={supplier.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="truncate">{supplier.name}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                              <span>{supplier.contactPerson}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                              <a
                                href={formatWhatsAppUrl(supplier.phone)}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-foreground"
                              >
                                {supplier.phone}
                              </a>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 max-w-40">
                            {supplier.link ? (
                              <a
                                href={
                                  supplier.link.startsWith("http")
                                    ? supplier.link
                                    : `https://${supplier.link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium truncate max-w-full"
                              >
                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                  {getStoreLabel(supplier.link)}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground/40">
                                -
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground max-w-xs hidden xl:table-cell">
                            {supplier.address ? (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="truncate">
                                  {supplier.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {supplier.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDialog({ type: "restore", supplier })}
                                  className="h-7.5 px-2 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                                  title="Restore Supplier"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDialog({ type: "edit", supplier })}
                                    className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                    title="Edit Supplier"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDialog({ type: "delete", supplier })}
                                    className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                    title="Delete Supplier"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:hidden gap-3.5 pt-1 pb-6">
              {displayedSuppliers.map((supplier) => (
                <Card
                  key={supplier.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-foreground text-sm truncate">
                            {supplier.name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {supplier.contactPerson}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <a
                          href={formatWhatsAppUrl(supplier.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-foreground hover:underline"
                        >
                          {supplier.phone}
                        </a>
                      </div>
                      {supplier.link && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                          <a
                            href={
                              supplier.link.startsWith("http")
                                ? supplier.link
                                : `https://${supplier.link}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">
                              {getStoreLabel(supplier.link)}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {supplier.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                      {supplier.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDialog({ type: "restore", supplier })}
                          className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore Supplier</span>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDialog({ type: "edit", supplier })}
                            className="flex-1 text-xs cursor-pointer rounded-xl h-8.5"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDialog({ type: "delete", supplier })}
                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-xl h-8.5"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <SupplierDialog
        isOpen={dialog?.type === "create" || dialog?.type === "edit"}
        onClose={() => setDialog(null)}
        supplier={dialog?.type === "edit" ? dialog.supplier : null}
        onSave={(data) => {
          if (dialog?.type === "edit") {
            handleUpdate(dialog.supplier.id, data);
          } else {
            handleCreate(data);
          }
          setDialog(null);
        }}
      />

      <ConfirmDialog
        isOpen={dialog?.type === "delete" || dialog?.type === "restore"}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.type === "delete") {
            handleDelete(dialog.supplier);
          } else if (dialog?.type === "restore") {
            handleRestore(dialog.supplier);
          }
          setDialog(null);
        }}
        title={
          dialog?.type === "delete" ? "Archive Supplier" : "Restore Supplier"
        }
        subtitle={
          dialog?.type === "delete" || dialog?.type === "restore"
            ? dialog.supplier.name
            : undefined
        }
        description={
          dialog?.type === "delete" ? (
            <span>
              Are you sure you want to move{" "}
              <strong>{dialog.supplier.name}</strong> to trash?
            </span>
          ) : (
            <span>
              Restore{" "}
              <strong>
                {dialog?.type === "restore" ? dialog.supplier.name : ""}
              </strong>{" "}
              back to active suppliers?
            </span>
          )
        }
        confirmText={
          dialog?.type === "delete" ? "Move to Trash" : "Restore Supplier"
        }
        cancelText="Cancel"
        variant={dialog?.type === "delete" ? "destructive" : "success"}
      />
    </div>
  );
};

export default SupplierPage;
