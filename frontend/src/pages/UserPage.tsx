import React, { useState, useMemo } from "react";
import type { UserItem } from "@/services/user";
import {
  getStoredUsers,
  addUser,
  updateUser,
  softDeleteUser,
  restoreUser,
} from "@/services/user";
import { UserDialog } from "@/components/user/UserDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { ViewModeSwitcher } from "@/components/shared/ViewModeSwitcher";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Users,
  Shield,
  Phone,
  RotateCcw,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { getInitials } from "@/utils/formatString";
import { useViewMode } from "@/hooks/useViewMode";
import { useTableSort } from "@/hooks/useTableSort";

export const UserPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserItem[]>(() =>
    getStoredUsers(true),
  );
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "CASHIER">(
    "ALL",
  );

  const { viewMode, userSwitchedView, handleViewModeChange } = useViewMode(
    "sela_user_view_mode",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [restoringUser, setRestoringUser] = useState<UserItem | null>(null);

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

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [allUsers, showDeleted, roleFilter, searchQuery]);

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

  const handleUpdate = (data: Omit<UserItem, "id"> & { password?: string }) => {
    if (!editingUser) return;
    const updated = updateUser(editingUser.id, data);
    if (updated) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${updated.name}" updated successfully`);
    }
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    const success = softDeleteUser(deletingUser.id);
    if (success) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${deletingUser.name}" moved to trash`);
      setDeletingUser(null);
    }
  };

  const handleRestore = () => {
    if (!restoringUser) return;
    const success = restoreUser(restoringUser.id);
    if (success) {
      setAllUsers(getStoredUsers(true));
      toast.success(`User "${restoringUser.name}" restored from trash`);
      setRestoringUser(null);
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

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 w-full xl:w-auto min-w-0">
          {/* Mobile & Tablet (< lg): Role Dropdown */}
          <div className="w-full sm:w-auto min-w-0 lg:hidden">
            <DropdownMenu className="w-full sm:w-auto">
              <DropdownMenuTrigger className="w-full sm:w-auto">
                <button
                  type="button"
                  className="flex items-center justify-between gap-1.5 sm:gap-2 h-9.5 px-3.5 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold transition-colors cursor-pointer select-none outline-none hover:border-primary/70 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-40 shadow-2xs min-w-0"
                >
                  <span className="truncate sm:whitespace-nowrap">
                    {roleFilter === "ALL"
                      ? "All Roles"
                      : roleFilter === "ADMIN"
                        ? "Admins"
                        : "Cashiers"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-44 rounded-xl p-1 bg-card border border-border/80 shadow-md"
              >
                {[
                  { id: "ALL", label: "All Roles" },
                  { id: "ADMIN", label: "Admins" },
                  { id: "CASHIER", label: "Cashiers" },
                ].map((r) => (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() =>
                      setRoleFilter(r.id as "ALL" | "ADMIN" | "CASHIER")
                    }
                    className={cn(
                      "flex items-center justify-between py-2 px-2.5 text-xs font-medium rounded-lg cursor-pointer transition-colors",
                      roleFilter === r.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    <span>{r.label}</span>
                    {roleFilter === r.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop (>= lg): Segmented Role Tabs */}
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
                onClick={() => {
                  setEditingUser(null);
                  setIsFormOpen(true);
                }}
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
          "animate-in fade-in-50 duration-200",
          userSwitchedView &&
            "motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-[0.99] motion-safe:duration-200",
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
              <Card
                key={u.id}
                className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-foreground text-sm leading-snug truncate">
                          {u.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border-transparent shrink-0"
                    >
                      {u.role === "ADMIN" ? "Admin" : "Cashier"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      {u.phone ? (
                        <a
                          href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-foreground hover:underline truncate"
                        >
                          {u.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span>Status:</span>
                      {u.status === "INACTIVE" ? (
                        <span className="text-[11px] font-bold text-destructive">
                          Inactive
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span>Created:</span>
                      <span className="text-[11px] font-medium text-foreground">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                    {u.isDeleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestoringUser(u)}
                        className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore User</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(u);
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
                          onClick={() => setDeletingUser(u)}
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
                            <span>Full Name</span>
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
                          onClick={() => requestSort("username")}
                          className="pb-2.5 px-3 cursor-pointer select-none group hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Username</span>
                            {sortConfig?.key === "username" ? (
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
                        <th className="pb-2.5 px-3">Role</th>
                        <th className="pb-2.5 px-3">Phone</th>
                        <th className="pb-2.5 px-3">Status</th>
                        <th className="pb-2.5 px-3">Created At</th>
                        <th className="pb-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {displayedUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-foreground">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                                {getInitials(u.name)}
                              </div>
                              <span>{u.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-muted-foreground font-medium">
                            @{u.username}
                          </td>

                          <td className="py-3 px-3 text-foreground font-semibold">
                            {u.role === "ADMIN" ? "Admin" : "Cashier"}
                          </td>

                          <td className="py-3 px-3 text-muted-foreground font-semibold">
                            {u.phone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                                <a
                                  href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline text-foreground"
                                >
                                  {u.phone}
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {u.status === "INACTIVE" ? (
                              <span className="text-[11px] font-bold text-destructive">
                                Inactive
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-muted-foreground font-medium">
                            {formatDate(u.createdAt)}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {u.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRestoringUser(u)}
                                  className="h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer"
                                  title="Restore User"
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
                                      setEditingUser(u);
                                      setIsFormOpen(true);
                                    }}
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                    title="Edit User"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingUser(u)}
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                    title="Delete User"
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
              {filteredUsers.map((u) => (
                <Card
                  key={u.id}
                  className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-foreground text-sm leading-snug truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border-transparent shrink-0"
                      >
                        {u.role === "ADMIN" ? "Admin" : "Cashier"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        {u.phone ? (
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-foreground hover:underline"
                          >
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span>Status:</span>
                        {u.status === "INACTIVE" ? (
                          <span className="text-[11px] font-bold text-destructive">
                            Inactive
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span>Created:</span>
                        <span className="text-[11px] font-medium text-foreground">
                          {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                      {u.isDeleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoringUser(u)}
                          className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore User</span>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(u);
                              setIsFormOpen(true);
                            }}
                            className="flex-1 text-xs cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingUser(u)}
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

      <UserDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={(data) => {
          if (editingUser) {
            handleUpdate(data);
          } else {
            handleCreate(data);
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!deletingUser}
        title="Move User to Trash?"
        subtitle="Confirm user deletion"
        description={
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">"{deletingUser?.name}"</strong>{" "}
            (@
            {deletingUser?.username})? It can be restored anytime from trash.
          </p>
        }
        confirmText="Delete User"
        variant="destructive"
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        isOpen={!!restoringUser}
        title="Restore User Account?"
        subtitle="Confirm account restoration"
        description={
          <p>
            User account{" "}
            <strong className="text-foreground">"{restoringUser?.name}"</strong>{" "}
            will be restored to active team list.
          </p>
        }
        confirmText="Restore User"
        variant="success"
        onClose={() => setRestoringUser(null)}
        onConfirm={handleRestore}
      />
    </div>
  );
};

export default UserPage;
