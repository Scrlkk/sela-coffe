import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const ProductSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={8}
    rowCount={6}
    gridCount={8}
    filterCount={2}
    hasAddButton={true}
    hasExportButton={true}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_product_view_mode"
  />
);

export default ProductSkeleton;
