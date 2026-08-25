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
}

export const FormDropdownPicker: React.FC<FormDropdownPickerProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  icon: Icon,
  className,
}) => {
  const selectedLabel =
    options.find((o) => o.id === value)?.label || placeholder;

  return (
    <DropdownMenu className={cn("w-full", className)}>
      <DropdownMenuTrigger className="w-full">
        <div className="w-full h-9.5 sm:h-10 px-3 rounded-xl border border-input bg-card text-foreground text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer hover:border-primary/60 transition-colors select-none">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
            <span className="font-bold text-foreground truncate">
              {selectedLabel}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-1.5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-full min-w-full max-w-full max-h-48 overflow-y-auto no-scrollbar p-1 rounded-xl bg-card border border-border/80 shadow-lg z-50 divide-y divide-border/30"
      >
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-colors text-xs",
                isSelected
                  ? "bg-primary/10 text-primary font-bold"
                  : "hover:bg-muted/60 text-foreground",
              )}
            >
              <span className="font-bold text-foreground truncate text-xs">
                {opt.label}
              </span>
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
