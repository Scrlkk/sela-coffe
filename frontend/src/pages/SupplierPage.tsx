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
  Mail,
  MapPin,
  RotateCcw,
  Building2,
} from "lucide-react";

export const SupplierPage: React.FC = () => {
  const [allSuppliers, setAllSuppliers] = useState<SupplierItem[]>(() =>
    getStoredSuppliers(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    try {
      const saved = localStorage.getItem("sela_supplier_view_mode");
      return saved === "grid" || saved === "table" ? saved : "table";
    } catch {
      return "table";
    }
  });

  const [userSwitchedView, setUserSwitchedView] = useState(false);

  const handleViewModeChange = (mode: "grid" | "table") => {
    if (mode !== viewMode) {
      setUserSwitchedView(true);
      setViewMode(mode);
    }
    try {
      localStorage.setItem("sela_supplier_view_mode", mode);
    } catch (e) {
      console.error(e);
    }
  };

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
    const withEmailCount = active.filter(
      (s) => s.email && s.email.trim().length > 0,
    ).length;

    return {
      totalActive: active.length,
      totalDeleted: deleted.length,
      withEmailCount,
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
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  }, [allSuppliers, showDeleted, searchQuery]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Active Suppliers"
          value={`${stats.totalActive} Partners`}
          badgeText="Active"
          badgeVariant="success"
          icon={Truck}
        />
        <StatCard
          title="Contact Persons"
          value={`${stats.totalActive} Reps`}
          badgeText="Registered"
          badgeVariant="neutral"
          icon={User}
        />
        <StatCard
          title="Verified Email"
          value={`${stats.withEmailCount} Email`}
          badgeText="Digital"
          badgeVariant="success"
          icon={Mail}
        />
        <StatCard
          title="Trash / Deleted"
          value={`${stats.totalDeleted} Inactive`}
          badgeText={stats.totalDeleted > 0 ? "Trash" : "Clean"}
          badgeVariant={stats.totalDeleted > 0 ? "danger" : "success"}
          icon={Trash2}
        />
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3 bg-card p-3 sm:p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              showDeleted
                ? "Search deleted suppliers..."
                : "Search supplier name, contact person, phone, email..."
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

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
          <ViewModeSwitcher value={viewMode} onChange={handleViewModeChange} />

          <Button
            variant="outline"
            onClick={() => setShowDeleted(!showDeleted)}
            className={cn(
              "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card flex-1 sm:flex-initial justify-center",
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

          {!showDeleted && (
            <Button
              onClick={() => {
                setEditingSupplier(null);
                setIsFormOpen(true);
              }}
              className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer flex-1 sm:flex-initial justify-center"
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
        {filteredSuppliers.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description={
              searchQuery
                ? `No results matching "${searchQuery}".`
                : showDeleted
                  ? "Archived suppliers trash is currently empty."
                  : "No suppliers registered yet. Click Add Supplier to get started."
            }
          />
        ) : viewMode === "grid" ? (
          /* GRID VIEW (Desktop, Tablet & Mobile) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 pb-6">
            {filteredSuppliers.map((supplier) => (
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
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{supplier.email}</span>
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
          /* TABLE VIEW ON DESKTOP/TABLET, AUTO-GRID ON MOBILE */
          <>
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <th className="pb-2.5 px-3">Supplier Name</th>
                        <th className="pb-2.5 px-3">Contact Person</th>
                        <th className="pb-2.5 px-3">Phone</th>
                        <th className="pb-2.5 px-3">Email Address</th>
                        <th className="pb-2.5 px-3">Location / Address</th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {filteredSuppliers.map((supplier) => (
                        <tr
                          key={supplier.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-primary shrink-0" />
                              <span>{supplier.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-foreground font-semibold">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{supplier.contactPerson}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-muted-foreground font-semibold">
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

                          <td className="py-3 px-3 text-muted-foreground">
                            {supplier.email ? (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <a
                                  href={`mailto:${supplier.email}`}
                                  className="hover:underline truncate max-w-40 block"
                                >
                                  {supplier.email}
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-muted-foreground max-w-xs">
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

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {supplier.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRestoringSupplier(supplier)}
                                  className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
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
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
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
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
                  className="border border-border/80 shadow-2xs hover:border-primary/50 transition-all overflow-hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                          {supplier.name.charAt(0).toUpperCase()}
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
                      {supplier.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{supplier.email}</span>
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
                            className="flex-1 text-xs cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingSupplier(supplier)}
                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
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
        onClose={() => setIsFormOpen(false)}
        supplier={editingSupplier}
        onSave={(data) => {
          if (editingSupplier) {
            handleUpdate(data);
          } else {
            handleCreate(data);
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!deletingSupplier}
        title="Delete Supplier?"
        subtitle="Confirm supplier removal"
        description={
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              "{deletingSupplier?.name}"
            </strong>
            ? It can be restored anytime from archived list.
          </p>
        }
        confirmText="Delete Supplier"
        variant="destructive"
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        isOpen={!!restoringSupplier}
        title="Restore Supplier?"
        subtitle="Confirm supplier restoration"
        description={
          <p>
            Supplier{" "}
            <strong className="text-foreground">
              "{restoringSupplier?.name}"
            </strong>{" "}
            will be restored to active partners list.
          </p>
        }
        confirmText="Restore Supplier"
        variant="success"
        onClose={() => setRestoringSupplier(null)}
        onConfirm={handleRestore}
      />
    </div>
  );
};

export default SupplierPage;
