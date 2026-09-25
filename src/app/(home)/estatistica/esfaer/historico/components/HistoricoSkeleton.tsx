/**
 * Skeleton da view "Histórico de Esforço Aéreo".
 *
 * Espelha o layout real para zero layout-shift: card do chart (faixa de
 * controles, leitura, área principal e brush) e rail de programas (cabeçalho,
 * busca e lista em seções por grupo). Mesmas regras de altura da tela real:
 * em `lg` o grid ocupa o resto da página presa à janela e o chart/a lista
 * crescem (`flex-1`); abaixo de `lg`, 330px no chart e teto de 420px na lista.
 *
 * O `HistoricoHeader` NÃO entra aqui de propósito: ele fica fora do ternário
 * de loading da página e já está em tela durante a carga.
 * Contagens fixas (sem Math.random) para evitar flicker/hydration mismatch.
 */

// Larguras fixas dos chips da faixa de controles (Total + Σ por grupo).
const TOOLBAR_CHIPS = ["w-20", "w-28", "w-24", "w-20"];
// Seções do rail (grupos) e linhas por seção — fixas.
const RAIL_SECOES = [8, 6, 4].map((n, s) =>
   Array.from({ length: n }, (_, i) => `${s}-${i}`)
);

export function HistoricoSkeleton() {
   return (
      <div className="grid grid-cols-1 gap-2 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-[minmax(0,1fr)]">
         {/* Card do chart */}
         <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm lg:min-h-0">
            {/* Faixa de controles (mesmo `border-b pb-3` da real) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
               {TOOLBAR_CHIPS.map((w, i) => (
                  <div
                     key={i}
                     className={`h-[34px] ${w} animate-pulse rounded bg-slate-200`}
                  />
               ))}
               {/* Ações fixas: "Extrato" e "Ver ano todo" */}
               <div className="ml-auto flex items-center gap-2">
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-28 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
            {/* Leitura do Total (valor em `text-lg`) */}
            <div className="h-[18px] w-64 shrink-0 animate-pulse rounded bg-slate-200" />
            {/* Principal (mesmo wrapper da real) + brush (78px + 15px de
                respiro do Apex), sem gap entre os dois. */}
            <div className="flex flex-col lg:min-h-0 lg:flex-1">
               <div className="h-[330px] animate-pulse rounded bg-slate-200 lg:h-auto lg:min-h-0 lg:flex-1" />
               <div className="h-[93px] shrink-0 animate-pulse rounded bg-slate-100" />
            </div>
         </div>

         {/* Rail de programas */}
         <div className="flex flex-col rounded border border-slate-200 bg-white p-4 shadow-sm lg:min-h-0">
            {/* Cabeçalho "PROGRAMAS (n)" + dica */}
            <div className="flex items-baseline justify-between gap-2">
               <div className="h-[14px] w-32 animate-pulse rounded bg-slate-200" />
               <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            {/* Busca */}
            <div className="mt-3 h-[34px] w-full animate-pulse rounded bg-slate-100" />

            {/* Seções: cabeçalho do grupo + linhas de uma linha só (checkbox,
                dot, nome, atual e Δ). Mesmo teto/crescimento da lista real. */}
            <div className="mt-3 max-h-[420px] overflow-hidden lg:max-h-none lg:min-h-0 lg:flex-1">
               {RAIL_SECOES.map((linhas, s) => (
                  <div key={s} className="pb-2">
                     <div className="flex items-center gap-2 py-1.5">
                        <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                        <div className="h-px flex-1 bg-slate-100" />
                     </div>
                     <div className="space-y-0.5">
                        {linhas.map((k) => (
                           <div
                              key={k}
                              className="flex items-center gap-2 border border-transparent py-1 pr-2 pl-1"
                           >
                              <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
                                 <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                              </div>
                              <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-slate-200" />
                              <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
                              <div className="h-4 w-12 shrink-0 animate-pulse rounded bg-slate-200" />
                              <div className="h-3 w-[52px] shrink-0 animate-pulse rounded bg-slate-100" />
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
