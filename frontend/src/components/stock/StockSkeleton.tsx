import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const StockSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={6}
    rowCount={6}
    gridCount={8}
    filterCount={1}
    hasAddButton={true}
    hasExportButton={false}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_stock_view_mode"
  />
);

export default StockSkeleton;
