import React from "react";
import { cn } from "@/lib/utils";

interface StatGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default StatGrid;
