import { Skeleton } from "@/components/ui/Skeleton";

/** Espelha o `FeedbackCard`: ícone + título/selo, meta, prévia. */
export function FeedbackListSkeleton() {
   return (
      <div role="status" className="space-y-3">
         <span className="sr-only">Carregando feedbacks…</span>
         {[0, 1, 2].map((i) => (
            <div
               key={i}
               aria-hidden
               className="relative rounded border border-slate-200 bg-white py-3 pr-9 pl-3 shadow-sm"
            >
               <div className="flex items-center gap-2.5">
                  <Skeleton className="size-8 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                     </div>
                     <Skeleton className="h-3 w-1/2" />
                  </div>
               </div>
               <Skeleton className="mt-2 h-5 w-4/5" />
            </div>
         ))}
      </div>
   );
}
