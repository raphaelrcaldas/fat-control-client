import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha o FeedbackCard: cabeçalho com avatar, texto e selo de status. */
export function FeedbacksSkeleton() {
   return (
      <div className="space-y-3">
         {[0, 1, 2].map((i) => (
            <div
               key={i}
               className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm"
            >
               <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                     <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                     <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                     </div>
                  </div>
                  <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
               </div>
               <Skeleton className="h-3 w-full" />
               <Skeleton className="h-3 w-4/5" />
            </div>
         ))}
      </div>
   );
}
