import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const CategorySkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={3}
    columnsCount={5}
    rowCount={6}
    gridCount={8}
    filterCount={1}
    hasAddButton={true}
    hasExportButton={false}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_category_view_mode"
  />
);

export default CategorySkeleton;
