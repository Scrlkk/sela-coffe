import React from "react";
import { Phone, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatWhatsAppUrl, getInitials } from "@/utils/formatString";
import { formatDate } from "@/utils/formatDate";
import type { UserItem } from "@/services/user";

interface UserViewProps {
  user: UserItem;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onRestore: (user: UserItem) => void;
}

export const UserGridCard: React.FC<UserViewProps> = ({
  user: u,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
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
                href={formatWhatsAppUrl(u.phone)}
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
              onClick={() => onRestore(u)}
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
                onClick={() => onEdit(u)}
                className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(u)}
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
  );
};

export const UserTableRow: React.FC<UserViewProps> = ({
  user: u,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-2.5 px-3 font-bold text-foreground">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
            {getInitials(u.name)}
          </div>
          <span className="truncate">{u.name}</span>
        </div>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-medium truncate">
        @{u.username}
      </td>

      <td className="py-2.5 px-3 text-foreground font-semibold whitespace-nowrap">
        {u.role === "ADMIN" ? "Admin" : "Cashier"}
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap hidden lg:table-cell">
        {u.phone ? (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <a
              href={formatWhatsAppUrl(u.phone)}
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-foreground text-xs"
            >
              {u.phone}
            </a>
          </div>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>

      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              u.status === "INACTIVE" ? "bg-destructive" : "bg-emerald-500",
            )}
          />
          <span
            className={
              u.status === "INACTIVE"
                ? "text-destructive"
                : "text-emerald-600 dark:text-emerald-400"
            }
          >
            {u.status === "INACTIVE" ? "Inactive" : "Active"}
          </span>
        </span>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground text-xs font-medium whitespace-nowrap hidden xl:table-cell">
        {formatDate(u.createdAt)}
      </td>

      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {u.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(u)}
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
                onClick={() => onEdit(u)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit User"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(u)}
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
  );
};

export const UserMobileCard: React.FC<UserViewProps> = ({
  user: u,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {getInitials(u.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-foreground text-sm leading-tight truncate">
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
                href={formatWhatsAppUrl(u.phone)}
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
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1.5">
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
            <span className="text-muted-foreground/70">
              {formatDate(u.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
          {u.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(u)}
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
                onClick={() => onEdit(u)}
                className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(u)}
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
  );
};
