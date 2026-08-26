import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div
        ref={ref}
        className={cn("relative inline-block text-left", className)}
      >
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className,
}) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  return (
    <div
      onClick={() => setOpen(!open)}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "end",
  side = "bottom",
  className,
}) => {
  const { open } = React.useContext(DropdownMenuContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 rounded-2xl bg-popover text-popover-foreground border border-border/80 shadow-xl dark:shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md",
        side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  className,
}) => {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <div
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors select-none",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => (
  <div className="my-1 h-px bg-border/60" />
);

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
    {children}
  </div>
);
