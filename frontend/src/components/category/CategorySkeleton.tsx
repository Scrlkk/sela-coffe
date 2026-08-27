import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const CategorySkeleton: React.FC = () => (
  <DataViewSkeleton statsCount={3} columnsCount={4} />
);

export default CategorySkeleton;
