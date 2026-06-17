/**
 * Skeleton da casca da página de detalhe do usuário. Espelha o hero, a barra
 * de abas e as duas seções de dados para zero layout-shift na carga.
 */

function FieldRowSkeleton() {
   return (
      <div className="flex items-center gap-3 px-5 py-3.5">
         <div className="h-9 w-9 shrink-0 rounded-md bg-slate-100" />
         <div className="space-y-1.5">
            <div className="h-2.5 w-24 rounded bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-200" />
         </div>
      </div>
   );
}

function SectionSkeleton({ rows }: { rows: number }) {
   return (
      <div className="rounded border border-slate-200 bg-white">
         <div className="border-b border-slate-100 px-5 py-3">
            <div className="h-4 w-36 rounded bg-slate-200" />
         </div>
         <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
               <FieldRowSkeleton key={i} />
            ))}
         </div>
      </div>
   );
}

export function UserDetailSkeleton() {
   return (
      <div className="flex flex-col space-y-2">
         <div className="animate-pulse overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {/* Hero */}
            <div className="bg-linear-to-r from-red-500 to-red-700 px-6 py-4">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 rounded bg-white/25" />
                  <div className="h-14 w-14 shrink-0 rounded-full bg-white/25" />
                  <div className="min-w-0 flex-1 space-y-2">
                     <div className="h-5 w-48 rounded bg-white/30" />
                     <div className="h-3 w-64 rounded bg-white/20" />
                  </div>
                  <div className="hidden gap-3 sm:flex">
                     <div className="h-8 w-20 rounded bg-white/25" />
                     <div className="h-8 w-20 rounded bg-white/25" />
                  </div>
               </div>
            </div>

            {/* Abas */}
            <div className="flex gap-6 border-b border-slate-200 px-6">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="py-3.5">
                     <div className="h-4 w-28 rounded bg-slate-200" />
                  </div>
               ))}
            </div>

            {/* Conteúdo */}
            <div className="space-y-5 p-6">
               <SectionSkeleton rows={5} />
               <SectionSkeleton rows={6} />
            </div>
         </div>
      </div>
   );
}
