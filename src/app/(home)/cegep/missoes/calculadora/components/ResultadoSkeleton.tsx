/**
 * Skeleton do estado "calculando" do ResultadoPanel — espelha a linha de
 * dias/diárias, o bloco de resumo por combinação (nota) e 2 blocos do
 * extrato por pernoite.
 */
export function ResultadoSkeleton() {
   return (
      <div className="animate-pulse space-y-4">
         <div className="h-4 w-48 rounded bg-slate-100" />

         <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-5 w-full rounded bg-slate-200" />
            <div className="h-5 w-full rounded bg-slate-200" />
            <div className="mt-1 h-7 w-full rounded bg-slate-200" />
         </div>

         <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-slate-100" />
            <div className="h-12 w-full rounded border border-slate-200 bg-slate-100" />
            <div className="h-12 w-full rounded border border-slate-200 bg-slate-100" />
         </div>
      </div>
   );
}
