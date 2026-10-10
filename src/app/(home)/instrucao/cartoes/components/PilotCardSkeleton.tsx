// Espelha o PilotCard colapsado 1:1 (avatar, nome, faixa de 6 badges w-44,
// chevron e, abaixo de `md`, a faixa de badges sob o nome) para zero
// layout-shift na troca skeleton → conteúdo.
const BADGES = [0, 1, 2, 3, 4, 5] as const;

export default function PilotCardSkeleton() {
   return (
      <div
         aria-hidden
         className="animate-pulse rounded border border-slate-200 bg-white px-3 py-2 shadow-sm"
      >
         <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />

            {/* Nome de guerra */}
            <div className="min-w-28 flex-1">
               <div className="h-4 w-32 rounded bg-slate-200" />
            </div>

            {/* Faixa de badges — mesma quebra do card real (oculta em <md) */}
            <div className="hidden flex-wrap justify-end gap-1.5 md:flex">
               {BADGES.map((i) => (
                  <div key={i} className="h-[22px] w-44 rounded bg-slate-100" />
               ))}
            </div>

            {/* Chevron */}
            <div className="h-4 w-4 shrink-0 rounded bg-slate-100" />
         </div>

         {/* Badges abaixo do nome em telas pequenas — mesma faixa do card */}
         <div className="mt-2 flex flex-wrap gap-1.5 pl-12 md:hidden">
            {BADGES.map((i) => (
               <div key={i} className="h-[22px] w-44 rounded bg-slate-100" />
            ))}
         </div>
      </div>
   );
}
