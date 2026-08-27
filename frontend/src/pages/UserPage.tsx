import React, { useState, useMemo, useDeferredValue } from "react";
import type { UserItem } from "@/services/user";
import {
  getStoredUsers,
  addUser,
  updateUser,
  softDeleteUser,
  restoreUser,
} from "@/services/user";
import { UserDialog } from "@/components/user/UserDialog";
import {
  UserGridCard,
  UserTableRow,
  UserMobileCard,
} from "@/components/user/UserViewItems";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDropdownPicker } from "@/components/shared/FormDropdownPicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  X,
  Trash2,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTh } from "@/components/shared/SortableTh";

type UserDialogState =
  | { type: "create" }
  | { type: "edit"; user: UserItem }
  | { type: "delete"; user: UserItem }
  | { type: "restore"; user: UserItem }
  | null;

export const UserPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserItem[]>(() =>
    getStoredUsers(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "CASHIER">(
    "ALL",
  );

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_user_view_mode",
  );

  const [dialog, setDialog] = useState<UserDialogState>(null);

  const stats = useMemo(() => {
    const active = allUsers.filter((u) => !u.isDeleted);
    const deleted = allUsers.filter((u) => u.isDeleted);
    const adminCount = active.filter((u) => u.role === "ADMIN").length;
    const cashierCount = active.filter((u) => u.role === "CASHIER").length;

    return {
      totalActive: active.length,
      totalDeleted: deleted.length,
      adminCount,
      cashierCount,
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const isStateMatch = showDeleted ? Boolean(u.isDeleted) : !u.isDeleted;
      if (!isStateMatch) return false;

      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      if (!deferredSearch.trim()) return true;
      const q = deferredSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [allUsers, showDeleted, roleFilter, deferredSearch]);

  const {
    sortedItems: displayedUsers,
    sortConfig,
    requestSort,
  } = useTableSort(filteredUsers, "name", "asc");

  const handleCreate = (data: Omit<UserItem, "id"> & { password?: string }) => {
    const created = addUser(data);
    setAllUsers(getStoredUsers(true));
    toast.success(`User "${created.name}" created successfully`);
  };

  const handleUpdate = (
    id: string,
    data: Omit<UserItem, "id"> & { password?: string },
  ) => {
    const updated = updateUser(id, data);
    if (updated) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${updated.name}" updated successfully`);
    }
  };

  const handleDelete = (user: UserItem) => {
    const success = softDeleteUser(user.id);
    if (success) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${user.name}" moved to trash`);
    }
  };

  const handleRestore = (user: UserItem) => {
    const success = restoreUser(user.id);
    if (success) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${user.name}" restored from trash`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 space-y-4">
      <StatGrid>
        <StatCard
          title="Total Users"
          value={`${stats.totalActive} Users`}
          icon={Users}
        />
        <StatCard
          title="Administrators"
          value={`${stats.adminCount} Admins`}
          badgeText="Full Access"
          badgeVariant="success"
          icon={Shield}
        />
        <StatCard
          title="Cashiers"
          value={`${stats.cashierCount} Staff`}
          badgeText="POS Access"
          badgeVariant="neutral"
          icon={UserCheck}
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
            placeholder={
              showDeleted
                ? "Search deleted users..."
                : "Search users by name, username, or phone..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9.5 rounded-xl bg-background text-xs font-medium border-border/80 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          <div className="w-full sm:w-auto min-w-0 lg:hidden">
            <FormDropdownPicker
              value={roleFilter}
              onChange={(val) => setRoleFilter(val as "ALL" | "ADMIN" | "CASHIER")}
              options={[
                { id: "ALL", label: "All Roles" },
                { id: "ADMIN", label: "Admins" },
                { id: "CASHIER", label: "Cashiers" },
              ]}
              className="w-full sm:w-40"
            />
          </div>

          <div className="hidden lg:flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs h-9.5 shrink-0">
            {(["ALL", "ADMIN", "CASHIER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "h-7.5 px-3 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center justify-center whitespace-nowrap",
                  roleFilter === r
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r === "ALL"
                  ? "All Roles"
                  : r === "ADMIN"
                    ? "Admins"
                    : "Cashiers"}
              </button>
            ))}
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
                "h-9.5 rounded-xl text-xs font-semibold gap-1.5 px-3 transition-all cursor-pointer shadow-2xs bg-card justify-center shrink-0",
                showDeleted
                  ? "border-2 border-destructive text-destructive hover:border-destructive hover:bg-card shadow-xs font-bold"
                  : "border border-border/80 text-foreground hover:border-primary/80 hover:bg-card",
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeleted ? "Active Users" : "Trash"}</span>
              {stats.totalDeleted > 0 && !showDeleted && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Button>

            {!showDeleted && (
              <Button
                onClick={() => setDialog({ type: "create" })}
                className="h-9.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 px-4 shadow-xs transition-all active:scale-[0.99] cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        key={viewMode}
        className={cn(
          userSwitchedView && "animate-in fade-in-50 zoom-in-98 duration-200",
        )}
      >
        {displayedUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              searchQuery || roleFilter !== "ALL"
                ? "No accounts match your search filters. Try resetting search criteria."
                : showDeleted
                  ? "Deleted user accounts trash is currently empty."
                  : "No users created yet. Click Add User to register your team."
            }
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 pt-1 pb-6">
            {displayedUsers.map((u) => (
              <UserGridCard
                key={u.id}
                user={u}
                onEdit={(user) => setDialog({ type: "edit", user })}
                onDelete={(user) => setDialog({ type: "delete", user })}
                onRestore={(user) => setDialog({ type: "restore", user })}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Card className="rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-xs text-card-foreground transition-all duration-200 w-full flex-col justify-between overflow-hidden mb-6">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full table-fixed text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider sticky top-0 bg-card z-10">
                        <SortableTh
                          label="Full Name"
                          sortKey="name"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="w-[32%] sm:w-[30%] md:w-[28%] lg:w-[24%] xl:w-[22%]"
                        />
                        <SortableTh
                          label="Username"
                          sortKey="username"
                          sortConfig={sortConfig}
                          onSort={requestSort}
                          className="w-[24%] sm:w-[22%] md:w-[20%] lg:w-[18%] xl:w-[16%]"
                        />
                        <th className="py-2.5 px-3 w-[16%] sm:w-[16%] md:w-[16%] lg:w-[14%] xl:w-[12%]">Role</th>
                        <th className="py-2.5 px-3 hidden lg:table-cell lg:w-[18%] xl:w-[16%] whitespace-nowrap">Phone</th>
                        <th className="py-2.5 px-3 w-[14%] sm:w-[16%] md:w-[18%] lg:w-[12%] xl:w-[10%]">Status</th>
                        <th className="py-2.5 px-3 hidden xl:table-cell xl:w-[14%]">Created</th>
                        <th className="py-2.5 px-3 text-right w-[14%] sm:w-[16%] md:w-[18%] lg:w-[14%] xl:w-[10%] whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedUsers.map((u) => (
                        <UserTableRow
                          key={u.id}
                          user={u}
                          onEdit={(user) => setDialog({ type: "edit", user })}
                          onDelete={(user) =>
                            setDialog({ type: "delete", user })
                          }
                          onRestore={(user) =>
                            setDialog({ type: "restore", user })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:hidden gap-3.5 pt-1 pb-6">
              {filteredUsers.map((u) => (
                <UserMobileCard
                  key={u.id}
                  user={u}
                  onEdit={(user) => setDialog({ type: "edit", user })}
                  onDelete={(user) => setDialog({ type: "delete", user })}
                  onRestore={(user) => setDialog({ type: "restore", user })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <UserDialog
        isOpen={dialog?.type === "create" || dialog?.type === "edit"}
        onClose={() => setDialog(null)}
        user={dialog?.type === "edit" ? dialog.user : null}
        onSave={(data) => {
          if (dialog?.type === "edit") {
            handleUpdate(dialog.user.id, data);
          } else {
            handleCreate(data);
          }
          setDialog(null);
        }}
      />

      <ConfirmDialog
        isOpen={dialog?.type === "delete" || dialog?.type === "restore"}
        title={
          dialog?.type === "delete"
            ? "Move User to Trash?"
            : "Restore User Account?"
        }
        subtitle={
          dialog?.type === "delete"
            ? "Confirm user deletion"
            : "Confirm account restoration"
        }
        description={
          dialog?.type === "delete" ? (
            <p>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                "{dialog.user.name}"
              </strong>{" "}
              (@{dialog.user.username})? It can be restored anytime from trash.
            </p>
          ) : (
            <p>
              User account{" "}
              <strong className="text-foreground">
                "{dialog?.type === "restore" ? dialog.user.name : ""}"
              </strong>{" "}
              will be restored to active team list.
            </p>
          )
        }
        confirmText={
          dialog?.type === "delete" ? "Delete User" : "Restore User"
        }
        variant={dialog?.type === "delete" ? "destructive" : "success"}
        onClose={() => setDialog(null)}
        onConfirm={() => {
          if (dialog?.type === "delete") {
            handleDelete(dialog.user);
          } else if (dialog?.type === "restore") {
            handleRestore(dialog.user);
          }
          setDialog(null);
        }}
      />
    </div>
  );
};

export default UserPage;
