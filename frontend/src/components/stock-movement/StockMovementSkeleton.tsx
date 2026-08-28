import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const StockMovementSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={7}
    rowCount={6}
    gridCount={8}
    filterCount={2}
    hasAddButton={false}
    hasExportButton={false}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_stock_movement_view_mode"
  />
);

export default StockMovementSkeleton;
