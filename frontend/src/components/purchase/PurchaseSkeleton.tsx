import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const PurchaseSkeleton: React.FC = () => (
  <DataViewSkeleton statsCount={4} columnsCount={7} rowCount={5} gridCount={6} />
);

export default PurchaseSkeleton;
