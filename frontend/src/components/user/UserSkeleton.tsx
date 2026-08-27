import React from "react";
import { DataViewSkeleton } from "@/components/shared/DataViewSkeleton";

export const UserSkeleton: React.FC = () => (
  <DataViewSkeleton statsCount={4} columnsCount={5} />
);

export default UserSkeleton;
