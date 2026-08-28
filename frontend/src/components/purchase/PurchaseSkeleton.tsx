import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const PurchaseSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={7}
    rowCount={5}
    gridCount={8}
    filterCount={1}
    hasAddButton={true}
    hasExportButton={true}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_purchase_view_mode"
  />
);

export default PurchaseSkeleton;
