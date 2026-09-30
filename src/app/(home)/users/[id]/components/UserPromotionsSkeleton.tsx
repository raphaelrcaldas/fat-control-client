import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Espelha a aba Promoções: o formulário de adicionar (só para quem pode
 * gerenciar) e o card "Progressão de Carreira" com as linhas.
 */
export function UserPromotionsSkeleton({
   comFormulario,
   rows = 3,
}: {
   comFormulario: boolean;
   rows?: number;
}) {
   return (
      <div role="status" className="space-y-5">
         <span className="sr-only">Carregando promoções…</span>
         {comFormulario && (
            <div
               aria-hidden
               className="flex flex-col gap-3 rounded border border-slate-200 bg-gray-50 p-4 sm:flex-row sm:items-end"
            >
               {[0, 1].map((i) => (
                  <div key={i} className="flex-1">
                     <Skeleton className="mb-1 h-4 w-24" />
                     <Skeleton className="h-[38px] w-full" />
                  </div>
               ))}
               <Skeleton className="h-[38px] w-28 shrink-0" />
            </div>
         )}

         <div aria-hidden className="rounded border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-3">
               <Skeleton className="h-5 w-40" />
            </div>
            <div className="divide-y divide-slate-100">
               {Array.from({ length: rows }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                     <Skeleton className="h-9 w-9 shrink-0" />
                     <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
