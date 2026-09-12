import { ReactNode } from "react";

/** Casca compartilhada com o skeleton: mesmas colunas, cabeçalho e limites. */
export function LastIndispsFrame({
   children,
   isLoading = false,
}: {
   children: ReactNode;
   isLoading?: boolean;
}) {
   return (
      <section
         aria-busy={isLoading}
         aria-label="Últimas atualizações"
         className="flex max-h-full min-h-0 w-full flex-col space-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
      >
         <h2 className="shrink-0 border-b border-slate-200 pb-2 text-center text-lg font-bold text-slate-800">
            Últimas Atualizações
         </h2>
         <div className="grid min-h-0 grid-cols-[max-content_max-content_max-content_max-content_max-content] content-start justify-between gap-x-1.5 gap-y-0.5 overflow-y-auto">
            <div className="sticky top-0 z-10 col-span-5 grid grid-cols-subgrid items-center justify-items-center border-b border-slate-200 bg-white px-1.5 py-2 text-center text-xs font-semibold text-slate-600 uppercase">
               <span>Trip.</span>
               <span>Motivo</span>
               <span>Período</span>
               <span>Atualização</span>
               <span title="Situação">Sit.</span>
            </div>
            {children}
         </div>
      </section>
   );
}
