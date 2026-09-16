"use client";

interface Props {
   titulo: string;
   /** Contagem ou resumo, à direita do título. */
   resumo?: React.ReactNode;
   /** Filtro do próprio painel — exceção, ver `SeboResumo`. */
   filtro?: React.ReactNode;
   /** Rótulo do rodapé que abre o modal; sem ele o painel não tem rodapé. */
   verTudo?: string;
   onVerTudo?: () => void;
   children: React.ReactNode;
}

/**
 * Moldura dos painéis de resumo do dossiê.
 *
 * Cada painel mostra um trecho e abre a lista inteira no modal pelo rodapé. A
 * seta indica que o rodapé leva a outro lugar, e não que expande no lugar.
 */
export function PainelResumo({
   titulo,
   resumo,
   filtro,
   verTudo,
   onVerTudo,
   children,
}: Props) {
   return (
      <section className="flex min-w-0 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
            <h2 className="text-sm font-bold text-slate-900">{titulo}</h2>
            {resumo && (
               <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                  {resumo}
               </span>
            )}
         </header>

         {filtro && (
            <div className="border-b border-slate-200 px-3 py-1.5">
               {filtro}
            </div>
         )}

         <div className="flex-1">{children}</div>

         {verTudo && onVerTudo && (
            <button
               type="button"
               onClick={onVerTudo}
               className="focus-visible:ring-primary-500 mt-auto flex w-full items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            >
               {verTudo}
               <span aria-hidden className="opacity-60">
                  ↗
               </span>
            </button>
         )}
      </section>
   );
}

/** Vazio de um painel do dossiê. */
export function PainelVazio({ children }: { children: React.ReactNode }) {
   return (
      <p className="px-3 py-10 text-center text-xs text-slate-600">
         {children}
      </p>
   );
}
