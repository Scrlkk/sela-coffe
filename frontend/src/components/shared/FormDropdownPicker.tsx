import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormDropdownOption {
  id: string;
  label: string;
}

interface FormDropdownPickerProps {
  options: FormDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
}

export const FormDropdownPicker: React.FC<FormDropdownPickerProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  icon: Icon,
  className,
  align = "start",
  side = "bottom",
}) => {
  const selectedLabel =
    options.find((o) => o.id === value)?.label || placeholder;

  return (
    <DropdownMenu className={cn("w-full", className)}>
      <DropdownMenuTrigger className="w-full">
        <button
          type="button"
          className="w-full h-9.5 px-3 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-semibold flex items-center justify-between cursor-pointer hover:border-primary/70 transition-colors select-none outline-none shadow-2xs min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            {Icon && (
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs font-semibold text-foreground truncate">
              {selectedLabel}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        className="w-full min-w-full max-w-full max-h-80 overflow-y-auto p-1 rounded-xl bg-popover text-popover-foreground border border-border/80 shadow-2xl z-50 divide-y divide-border/20"
      >
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-xs font-medium",
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-muted/60 text-foreground",
              )}
            >
              <span className="truncate text-xs">{opt.label}</span>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FormDropdownPicker;
