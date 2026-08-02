import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILTER_OPTIONS } from "@/constants/dashboard";

interface PeriodFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PeriodFilterDropdown: React.FC<PeriodFilterDropdownProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-card/60 hover:bg-secondary/60 text-foreground text-[11px] font-semibold shadow-xs transition-colors cursor-pointer select-none",
            className,
          )}
        >
          <Calendar className="w-3 h-3 text-foreground/80" />
          <span>{value}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1">
        {FILTER_OPTIONS.map((period) => (
          <DropdownMenuItem
            key={period}
            onClick={() => onChange(period)}
            className="flex items-center justify-between py-1.5"
          >
            <span>{period}</span>
            {value === period && (
              <Check className="w-3 h-3 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PeriodFilterDropdown;
