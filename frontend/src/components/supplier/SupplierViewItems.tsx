import React from "react";
import {
  Building2,
  User,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatWhatsAppUrl } from "@/utils/formatString";
import type { SupplierItem } from "@/services/supplier";

interface SupplierViewProps {
  supplier: SupplierItem;
  storeLabel: string;
  onEdit: (supplier: SupplierItem) => void;
  onDelete: (supplier: SupplierItem) => void;
  onRestore: (supplier: SupplierItem) => void;
}

export const SupplierGridCard: React.FC<SupplierViewProps> = ({
  supplier,
  storeLabel,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="group relative border border-border/60 shadow-2xs rounded-2xl bg-card text-card-foreground transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden flex flex-col justify-between select-none">
      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8.5 h-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground text-sm leading-snug truncate">
                  {supplier.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                  <span className="truncate">{supplier.contactPerson || "No Representative"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            {supplier.phone ? (
              <a
                href={formatWhatsAppUrl(supplier.phone)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:underline truncate"
              >
                {supplier.phone}
              </a>
            ) : (
              <span className="text-muted-foreground/50">-</span>
            )}
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
                <span className="truncate">{storeLabel}</span>
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
              onClick={() => onRestore(supplier)}
              className="w-full text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Supplier</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(supplier)}
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

export const SupplierTableRow: React.FC<SupplierViewProps> = ({
  supplier,
  storeLabel,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="py-2.5 px-3 font-bold text-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">{supplier.name}</span>
        </div>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span className="truncate">{supplier.contactPerson || "—"}</span>
        </div>
      </td>

      <td className="py-2.5 px-3 text-muted-foreground font-semibold whitespace-nowrap hidden lg:table-cell">
        {supplier.phone ? (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <a
              href={formatWhatsAppUrl(supplier.phone)}
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-foreground text-xs"
            >
              {supplier.phone}
            </a>
          </div>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>

      <td className="py-2.5 px-3 truncate">
        {supplier.link ? (
          <a
            href={
              supplier.link.startsWith("http")
                ? supplier.link
                : `https://${supplier.link}`
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium truncate max-w-full text-xs"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{storeLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
          </a>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      <td className="py-2.5 px-3 text-muted-foreground hidden xl:table-cell truncate">
        {supplier.address ? (
          <div className="flex items-start gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="truncate">{supplier.address}</span>
          </div>
        ) : (
          "—"
        )}
      </td>

      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {supplier.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(supplier)}
              className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 text-xs font-semibold gap-1 cursor-pointer shadow-2xs"
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
                onClick={() => onEdit(supplier)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                title="Edit Supplier"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(supplier)}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Move to Trash"
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

export const SupplierMobileCard: React.FC<SupplierViewProps> = ({
  supplier,
  storeLabel,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8.5 h-8.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-foreground text-sm leading-snug truncate">
                {supplier.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate">{supplier.contactPerson || "No Representative"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            {supplier.phone ? (
              <a
                href={formatWhatsAppUrl(supplier.phone)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:underline truncate"
              >
                {supplier.phone}
              </a>
            ) : (
              <span className="text-muted-foreground/50">-</span>
            )}
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
                <span className="truncate">{storeLabel}</span>
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
              onClick={() => onRestore(supplier)}
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
                onClick={() => onEdit(supplier)}
                className="h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer flex-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(supplier)}
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
