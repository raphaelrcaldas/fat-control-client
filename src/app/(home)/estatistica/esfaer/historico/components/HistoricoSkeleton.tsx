/**
 * Skeleton da view "Histórico de Esforço Aéreo".
 *
 * Espelha o layout real para zero layout-shift: toolbar (chips ~34px), card do
 * chart (linha de título de ~14px + área de 330px + brush de 78px, sem gap
 * entre os dois) e rail de programas (~330px: cabeçalho, busca e lista com o
 * mesmo teto de 420px).
 *
 * O `HistoricoHeader` NÃO entra aqui de propósito: ele fica fora do ternário
 * de loading da página e já está em tela durante a carga.
 * Contagens fixas (sem Math.random) para evitar flicker/hydration mismatch.
 */

// Larguras fixas dos chips da toolbar (Total + Σ por grupo).
const TOOLBAR_CHIPS = ["w-20", "w-32", "w-32", "w-28"];
// Quantidade fixa de cards do rail de programas.
const RAIL_ROWS = Array.from({ length: 8 }, (_, i) => i);

export function HistoricoSkeleton() {
   return (
      <div className="space-y-2">
         {/* Faixa de toolbar */}
         <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 shadow-sm">
            {TOOLBAR_CHIPS.map((w, i) => (
               <div
                  key={i}
                  className={`h-[34px] ${w} animate-pulse rounded bg-slate-200`}
               />
            ))}
            <div className="ml-auto h-8 w-28 animate-pulse rounded bg-slate-100" />
         </div>

         {/* Chart à esquerda + rail à direita */}
         <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_330px]">
            {/* Card do chart: título + área principal + brush */}
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
               {/* Espelha o `h2` real: `text-xs` com raiz 87,5% dá ~14px de
                   linha, dentro de um cabeçalho `mb-2`. */}
               <div className="mb-2 h-[14px] w-56 animate-pulse rounded bg-slate-200" />
               {/* Mesmas alturas fixas do chart real (MAIN_HEIGHT/BRUSH_HEIGHT).
                   Sem gap entre eles: no chart real os dois <Chart> são irmãos
                   diretos, e um `mt-2` aqui deslocaria tudo em 8px na troca. */}
               <div className="h-[330px] w-full animate-pulse rounded bg-slate-200" />
               <div className="h-[78px] w-full animate-pulse rounded bg-slate-100" />
            </div>

            {/* Rail de programas */}
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
               {/* Cabeçalho "PROGRAMAS (n)" + dica */}
               <div className="flex items-baseline justify-between gap-2">
                  <div className="h-[14px] w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
               {/* Busca */}
               <div className="mt-3 h-[34px] w-full animate-pulse rounded bg-slate-100" />

               {/* Cards de programa (duas linhas: nome+badge | atual+Δ).
                   Mesmo teto da lista real (`max-h-[420px]` em ProgramRail):
                   sem ele as 8 linhas passariam de 420px e o card encolheria
                   quando os dados chegassem. */}
               <div className="mt-3 max-h-[420px] space-y-2 overflow-hidden">
                  {RAIL_ROWS.map((i) => (
                     <div
                        key={i}
                        className="flex items-center gap-3 rounded border border-slate-200 bg-white px-3 py-2"
                     >
                        <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-slate-200" />
                        <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-slate-200" />
                        <div className="min-w-0 flex-1 space-y-1">
                           <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                           <div className="h-[18px] w-16 animate-pulse rounded bg-slate-100" />
                        </div>
                        <div className="shrink-0 space-y-1">
                           <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
                           <div className="ml-auto h-3 w-10 animate-pulse rounded bg-slate-100" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
