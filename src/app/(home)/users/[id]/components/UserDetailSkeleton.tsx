/**
 * Skeleton do painel "Dados Cadastrais" da página de detalhe do usuário: as
 * duas seções de dados. O hero (voltar, identidade) e a barra de abas são da
 * página e montam já, sem esperar o dado.
 */

function FieldRowSkeleton() {
   return (
      <div className="flex items-center gap-3 px-5 py-3.5">
         <div className="h-9 w-9 shrink-0 rounded bg-slate-100" />
         <div className="space-y-1.5">
            <div className="h-2.5 w-24 rounded bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-200" />
         </div>
      </div>
   );
}

function SectionSkeleton({ rows }: { rows: number }) {
   return (
      <div className="rounded border border-slate-200 bg-white shadow">
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
      <div role="status" className="animate-pulse space-y-2">
         <span className="sr-only">Carregando dados cadastrais…</span>
         <div aria-hidden className="space-y-2">
            <SectionSkeleton rows={5} />
            <SectionSkeleton rows={11} />
         </div>
      </div>
   );
}
