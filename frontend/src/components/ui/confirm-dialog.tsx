import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "destructive" | "success" | "warning" | "primary";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
  icon,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-emerald-500/10 text-emerald-500",
          defaultIcon: <RotateCcw className="w-5 h-5" />,
          buttonClass:
            "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold shadow-none",
          buttonVariant: "default" as const,
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10 text-amber-500",
          defaultIcon: <AlertCircle className="w-5 h-5" />,
          buttonClass: "bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold",
          buttonVariant: "default" as const,
        };
      case "primary":
        return {
          iconBg: "bg-primary/10 text-primary",
          defaultIcon: <AlertCircle className="w-5 h-5" />,
          buttonClass: "text-xs font-bold",
          buttonVariant: "default" as const,
        };
      case "destructive":
      default:
        return {
          iconBg: "bg-destructive/10 text-destructive",
          defaultIcon: <AlertTriangle className="w-5 h-5" />,
          buttonClass: "text-xs font-bold",
          buttonVariant: "destructive" as const,
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border/80 rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-5 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={cn("p-2.5 rounded-xl", currentVariant.iconBg)}>
              {icon || currentVariant.defaultIcon}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 rounded-xl border-border text-foreground hover:bg-muted text-xs font-bold transition-all cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            variant={currentVariant.buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "h-9 rounded-xl transition-all cursor-pointer",
              currentVariant.buttonClass,
            )}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
