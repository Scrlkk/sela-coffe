import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const StockMovementSkeleton: React.FC = () => (
  <DataViewSkeleton statsCount={4} columnsCount={6} />
);

export default StockMovementSkeleton;
