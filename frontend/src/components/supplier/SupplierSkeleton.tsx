import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const SupplierSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={6}
    rowCount={6}
    gridCount={8}
    filterCount={1}
    hasAddButton={true}
    hasExportButton={true}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_supplier_view_mode"
  />
);

export default SupplierSkeleton;
