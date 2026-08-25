import React, { useState, useMemo } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";

const getStoreLabel = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "Store Link";
  }
};

export const SupplierPage: React.FC = () => {
  const [allSuppliers, setAllSuppliers] = useState<SupplierItem[]>(() =>
    getStoredSuppliers(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_supplier_view_mode",
    "table",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(
    null,
  );
  const [deletingSupplier, setDeletingSupplier] = useState<SupplierItem | null>(
    null,
  );
  const [restoringSupplier, setRestoringSupplier] =
    useState<SupplierItem | null>(null);

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

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.link && s.link.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  }, [allSuppliers, showDeleted, searchQuery]);

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

  const handleUpdate = (data: Omit<SupplierItem, "id">) => {
    if (!editingSupplier) return;
    const updated = updateSupplier(editingSupplier.id, data);
    if (updated) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${updated.name}" updated successfully`);
    }
  };

  const handleDelete = () => {
    if (!deletingSupplier) return;
    const success = softDeleteSupplier(deletingSupplier.id);
    if (success) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${deletingSupplier.name}" archived`);
      setDeletingSupplier(null);
    }
  };

  const handleRestore = () => {
    if (!restoringSupplier) return;
    const success = restoreSupplier(restoringSupplier.id);
    if (success) {
      setAllSuppliers(getStoredSuppliers(true));
      toast.success(`Supplier "${restoringSupplier.name}" restored`);
      setRestoringSupplier(null);
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

        {/* ponytail: smart responsive action controls - 1 row on xl, auto-wrap/stacked below on < xl */}
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
              onClick={() => {
                setEditingSupplier(null);
                setIsFormOpen(true);
              }}
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
                ? `No supplier matches "${searchQuery}".`
                : showDeleted
                  ? "Archived suppliers trash is currently empty."
                  : "No supplier partners registered yet. Click 'Add Supplier' to get started."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 pb-6">
            {displayedSuppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary shrink-0" />
                        <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                          {supplier.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {supplier.contactPerson}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a
                        href={`https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}`}
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
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline truncate max-w-56"
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
                        onClick={() => setRestoringSupplier(supplier)}
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
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setIsFormOpen(true);
                          }}
                          className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingSupplier(supplier)}
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
                        <th
                          onClick={() => requestSort("name")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Supplier Name</span>
                            {sortConfig?.key === "name" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th
                          onClick={() => requestSort("contactPerson")}
                          className="pb-2.5 px-3 hidden md:table-cell cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Contact Person</span>
                            {sortConfig?.key === "contactPerson" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                        <th className="pb-2.5 px-3">Phone / WhatsApp</th>
                        <th className="pb-2.5 px-3 hidden lg:table-cell">
                          Store / Purchase Link
                        </th>
                        <th className="pb-2.5 px-3 hidden xl:table-cell">
                          Location / Address
                        </th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedSuppliers.map((supplier) => (
                        <tr
                          key={supplier.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-bold text-foreground text-xs sm:text-sm">
                                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">
                                  {supplier.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground block truncate md:hidden pl-5">
                                Contact: {supplier.contactPerson}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-foreground font-semibold hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">
                                {supplier.contactPerson}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                              <a
                                href={`https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-foreground"
                              >
                                {supplier.phone}
                              </a>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                            {supplier.link ? (
                              <a
                                href={
                                  supplier.link.startsWith("http")
                                    ? supplier.link
                                    : `https://${supplier.link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                <Globe className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-40">
                                  {getStoreLabel(supplier.link)}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground/50">
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
                                  onClick={() => setRestoringSupplier(supplier)}
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
                                    onClick={() => {
                                      setEditingSupplier(supplier);
                                      setIsFormOpen(true);
                                    }}
                                    className="h-7.5 w-7.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                    title="Edit Supplier"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setDeletingSupplier(supplier)
                                    }
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

            <div className="grid grid-cols-1 gap-3.5 sm:hidden pt-1 pb-6">
              {filteredSuppliers.map((supplier) => (
                <Card
                  key={supplier.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs"
                >
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground leading-tight">
                            {supplier.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" />{" "}
                            {supplier.contactPerson}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <a
                          href={`https://wa.me/${supplier.phone.replace(/[^0-9]/g, "")}`}
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
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            <span>{getStoreLabel(supplier.link)}</span>
                            <ExternalLink className="w-3 h-3" />
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
                          onClick={() => setRestoringSupplier(supplier)}
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
                            onClick={() => {
                              setEditingSupplier(supplier);
                              setIsFormOpen(true);
                            }}
                            className="flex-1 text-xs cursor-pointer rounded-xl h-8.5"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingSupplier(supplier)}
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
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSave={editingSupplier ? handleUpdate : handleCreate}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Archive Supplier"
        subtitle={deletingSupplier?.name}
        description={
          <span>
            Are you sure you want to move <strong>{deletingSupplier?.name}</strong> to trash?
          </span>
        }
        confirmText="Move to Trash"
        cancelText="Cancel"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={Boolean(restoringSupplier)}
        onClose={() => setRestoringSupplier(null)}
        onConfirm={handleRestore}
        title="Restore Supplier"
        subtitle={restoringSupplier?.name}
        description={
          <span>
            Restore <strong>{restoringSupplier?.name}</strong> back to active suppliers?
          </span>
        }
        confirmText="Restore Supplier"
        cancelText="Cancel"
        variant="success"
      />
    </div>
  );
};

export default SupplierPage;
