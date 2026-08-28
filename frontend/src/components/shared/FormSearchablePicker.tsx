import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface FormSearchablePickerProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
}

export const FormSearchablePicker: React.FC<FormSearchablePickerProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Type to search...",
  icon: Icon,
  className,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const handleClose = () => {
    setOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  });

  const handleSelect = (id: string) => {
    onChange(id);
    handleClose();
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "w-full h-9.5 px-3 rounded-xl border border-border/80 bg-background dark:bg-input/30 text-foreground text-xs font-medium flex items-center justify-between cursor-pointer transition-all outline-none shadow-2xs min-w-0 select-none",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "hover:border-primary/60",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary shrink-0" />}
          <span
            className={cn(
              "truncate block text-xs",
              selectedOption
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1.5 transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-60 rounded-2xl bg-card border border-border/80 shadow-xl dark:shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-64">
          <div className="p-2 border-b border-border/60 bg-muted/30 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-7 rounded-lg bg-background text-xs text-foreground placeholder:text-muted-foreground/70 border border-border/60 focus:border-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1 space-y-0.5 no-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center">
                <p className="text-xs text-muted-foreground">
                  No matching items
                </p>
                {searchQuery && (
                  <p className="text-[10.5px] text-muted-foreground/60 mt-0.5 truncate">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs",
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted/60 text-foreground",
                    )}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="block truncate font-semibold text-xs leading-tight">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="block truncate text-[10.5px] text-muted-foreground font-normal mt-0.5">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSearchablePicker;
