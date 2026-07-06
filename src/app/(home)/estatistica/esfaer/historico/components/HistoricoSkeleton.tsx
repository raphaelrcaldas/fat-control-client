/**
 * Skeleton da view "Histórico de Esforço Aéreo".
 *
 * Espelha o layout real para zero layout-shift: toolbar (chips ~34px), card do
 * chart (linha de título + área que preenche a altura no desktop + brush de
 * 78px) e rail de programas (~330px: cabeçalho, busca e cards de duas linhas).
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
               <div className="mb-2 h-4 w-56 animate-pulse rounded bg-slate-200" />
               {/* Placeholder da área do chart. O grid real tem altura MEDIDA
                   em px (page.tsx) — aqui aproximamos por CSS p/ minimizar o
                   layout-shift na chegada dos dados. O 256px ≈ navbar(64) +
                   padding do <main>(16) + header(~100) + toolbar(~50) + gaps +
                   respiro; se o header/toolbar mudarem de altura, reavaliar. */}
               <div className="h-[330px] w-full animate-pulse rounded bg-slate-200 lg:h-[calc(100dvh-256px)]" />
               <div className="mt-2 h-[78px] w-full animate-pulse rounded bg-slate-100" />
            </div>

            {/* Rail de programas */}
            <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
               {/* Cabeçalho "PROGRAMAS (n)" + dica */}
               <div className="flex items-baseline justify-between gap-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
               </div>
               {/* Busca */}
               <div className="mt-3 h-[34px] w-full animate-pulse rounded bg-slate-100" />

               {/* Cards de programa (duas linhas: nome+badge | atual+Δ) */}
               <div className="mt-3 space-y-2">
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
