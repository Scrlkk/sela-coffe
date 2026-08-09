import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
      <Card className="bg-card border border-border/60 shadow-md rounded-3xl overflow-hidden w-full p-0">
        {/* Top Banner Skeleton */}
        <div className="h-24 sm:h-32 bg-primary/20 relative p-4 flex justify-end items-start">
          <Skeleton className="h-6 w-36 rounded-full opacity-60" />
        </div>

        <CardContent className="p-4 sm:p-5 pt-0 relative space-y-4">
          {/* Avatar & Theme Selector Skeleton */}
          <div className="flex items-end justify-between gap-4 -mt-9 sm:-mt-12 mb-3">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-card" />
            <Skeleton className="h-8 w-32 rounded-2xl" />
          </div>

          {/* User Name & Role Badge Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>

          {/* User Info Section Skeleton */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-10.5 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-border/60 my-2" />

          {/* Security & Password Section Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-44 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-10.5 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className="pt-2 flex justify-end">
            <Skeleton className="h-10.5 w-32 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSkeleton;
