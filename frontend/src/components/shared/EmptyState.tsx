import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        "h-64 flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-dashed border-border/60",
        className,
      )}
    >
      {title && <p className="text-sm font-bold text-foreground">{title}</p>}
      <p
        className={cn(
          "text-xs text-muted-foreground max-w-sm",
          title && "mt-1",
        )}
      >
        {description}
      </p>
    </div>
  );
};
