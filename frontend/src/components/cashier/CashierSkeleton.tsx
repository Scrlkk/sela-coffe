import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CashierSkeleton() {
  return (
    <div className="h-full flex flex-col xl:flex-row gap-5 items-start w-full animate-in fade-in duration-300">
      <div className="flex-1 w-full flex flex-col min-w-0">
        <div className="flex flex-col gap-2.5 bg-card p-3 sm:p-3.5 rounded-2xl border border-border/80 shadow-xs mb-4">
          <Skeleton className="h-9.5 w-full rounded-xl" />
          <div className="flex items-center gap-1.5 overflow-hidden pb-0.5 pt-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3.5 pt-1 pb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="border border-border/60 shadow-2xs rounded-2xl bg-card p-3.5 sm:p-4 flex flex-col justify-between select-none h-32"
            >
              <CardContent className="p-0 flex flex-col justify-between h-full space-y-2.5">
                <div className="space-y-1.5 pr-6">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                  <Skeleton className="h-3 w-10 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md font-mono" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-full xl:w-96 2xl:w-105 shrink-0 xl:h-full pb-6 xl:pb-0">
        <Card className="border border-border/60 shadow-xs rounded-2xl bg-card text-card-foreground h-full flex flex-col justify-between overflow-hidden">
          <CardContent className="px-4 sm:px-5 pt-3.5 sm:pt-4 pb-4 sm:pb-5 flex flex-col h-full space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-14 rounded-md" />
            </div>

            <div className="flex-1 space-y-2 min-h-40">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2"
                >
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md font-mono" />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Skeleton className="w-6 h-6 rounded-md" />
                    <Skeleton className="w-4 h-4 rounded-md" />
                    <Skeleton className="w-6 h-6 rounded-md" />
                    <Skeleton className="w-6 h-6 rounded-md ml-0.5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border/60 space-y-3 mt-auto">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-3.5 w-24 rounded-md font-mono" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-20 rounded-md font-mono" />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-md font-mono" />
                </div>
              </div>

              <Skeleton className="w-full h-11 rounded-full mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CashierSkeleton;
