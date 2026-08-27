import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const IngredientSkeleton: React.FC = () => (
  <DataViewSkeleton statsCount={4} columnsCount={6} />
);

export default IngredientSkeleton;
