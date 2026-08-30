import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const TransactionSkeleton: React.FC<{
  viewMode?: "table" | "grid";
}> = ({ viewMode }) => (
  <DataViewSkeleton
    statsCount={4}
    columnsCount={6}
    rowCount={6}
    gridCount={8}
    filterCount={2}
    hasAddButton={false}
    hasExportButton={false}
    hasViewSwitcher={true}
    viewMode={viewMode}
    storageKey="sela_transaction_view_mode"
  />
);

export default TransactionSkeleton;
