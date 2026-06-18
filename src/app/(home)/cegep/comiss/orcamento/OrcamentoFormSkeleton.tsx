const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const FaintBar = ({ className = "" }: { className?: string }) => (
   <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
);

/** Campo: rótulo + input. */
function FieldSkeleton() {
   return (
      <div className="space-y-2">
         <FaintBar className="h-3 w-32" />
         <Bar className="h-10 w-full" />
      </div>
   );
}

/**
 * Skeleton fiel ao corpo do card de edição de teto orçamentário (2 campos,
 * grade de cotas e barra de alocação), para zero layout-shift ao carregar.
 */
export function OrcamentoFormSkeleton() {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
         </div>

         <hr className="border-slate-100" />

         <div>
            <FaintBar className="mb-3 h-4 w-40" />
            <div className="rounded bg-slate-50 p-4">
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FieldSkeleton />
                  <FieldSkeleton />
               </div>
            </div>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between">
               <FaintBar className="h-4 w-40" />
               <FaintBar className="h-4 w-20" />
            </div>
            <Bar className="h-4 w-full" />
         </div>
      </div>
   );
}
