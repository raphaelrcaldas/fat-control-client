"use client";

// Espelha o layout real da trilha (OrdemHistoricoItem dentro da Timeline):
// linha vertical à esquerda, bolinha por evento e, à direita, carimbo, título
// e linhas de mudança — para não haver salto quando os logs chegam.
//
// As medidas são as mesmas do tema compartilhado (`timelineTheme.ts`):
// `border-l` na lista, `mb-4 ml-4` por item e a bolinha `h-3 w-3` em
// `-left-1.5`. Ao mexer no tema, mexa aqui junto, senão o skeleton passa a
// mentir sobre a altura.

// Linhas de mudança por evento: padrão fixo (nunca aleatório, que causaria
// flicker e divergência de hidratação). Contagem calibrada contra a altura
// real medida.
const LINHAS_POR_EVENTO = [2, 4, 2];

export function OrdemHistoricoSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando histórico"
         className="animate-pulse"
      >
         <ol className="relative border-l border-gray-200">
            {LINHAS_POR_EVENTO.map((linhas, index) => (
               <li key={index} className="mb-4 ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-200" />
                  <div className="mb-0.5 h-3 w-28 rounded bg-slate-100" />
                  <div className="h-3.5 w-44 rounded bg-slate-200" />
                  <div className="mt-2 space-y-1">
                     {Array.from({ length: linhas }).map((_, linha) => (
                        <div
                           key={linha}
                           className="h-3.5 w-full max-w-sm rounded bg-slate-100"
                        />
                     ))}
                  </div>
               </li>
            ))}
         </ol>
      </div>
   );
}
