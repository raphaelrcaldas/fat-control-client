interface EscalaSkeletonProps {
   columns?: number;
   cardsPerSubList?: number;
}

export function EscalaSkeleton({
   columns = 3,
   cardsPerSubList = 3,
}: EscalaSkeletonProps) {
   return (
      <div className="flex flex-wrap items-start gap-4">
         {Array.from({ length: columns }).map((_, i) => (
            <ColumnSkeleton key={i} cardsPerSubList={cardsPerSubList} />
         ))}
      </div>
   );
}

function ColumnSkeleton({ cardsPerSubList }: { cardsPerSubList: number }) {
   return (
      <section className="relative flex w-full flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:w-68 sm:shrink-0 sm:grow-0">
         <div className="absolute inset-y-0 left-0 w-1.5 bg-slate-200" />

         {/* Duas linhas, como o cabeçalho real (que agora sempre quebra):
             numa linha só o skeleton media 57px contra os 66px do conteúdo, e
             a régua da 1ª sublista saltava 9px na troca. */}
         <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-3 pl-7">
            {/* Alturas cravadas nas linhas do cabeçalho REAL, medidas no
                navegador: 17px (índice + título) e 16,5px (contagens DI/IN),
                com gap 10,5 e padding 21 = 66px. Dimensionar pelos blocos de
                pulse deixava o skeleton em 57px, 9px mais raso, e a régua
                "DISPONÍVEIS" saltava na troca. */}
            <div className="flex h-[17px] items-center gap-2">
               <div className="h-3 w-5 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
               <div className="h-4 w-20 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            </div>
            <div className="flex h-[16.5px] w-full items-center gap-2">
               <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-200 motion-reduce:animate-none" />
               <div className="h-3 w-4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
               <div className="h-2 w-2 animate-pulse rounded-full bg-rose-200 motion-reduce:animate-none" />
               <div className="h-3 w-4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            </div>
         </header>

         <div className="space-y-5 px-4 py-4 pl-6">
            <SubListSkeleton accent="bg-emerald-300" cards={cardsPerSubList} />
            {/* A sublista "Indisponíveis" nasce COLAPSADA na tela real
                (`defaultOpen={false}` em FuncSection), então aqui ela é só o
                cabeçalho. Desenhar um card garantia layout shift na chegada
                dos dados. */}
            <SubListSkeleton accent="bg-rose-300" cards={0} collapsed />
         </div>
      </section>
   );
}

function SubListSkeleton({
   accent,
   cards,
   collapsed = false,
}: {
   accent: string;
   cards: number;
   collapsed?: boolean;
}) {
   return (
      <div>
         <div className="mb-2 flex items-center gap-2">
            <span
               className={`inline-block h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none ${accent}`}
            />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-2.5 w-5 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="ml-1 h-px flex-1 bg-slate-200" />
            {/* Chevron do cabeçalho colapsável, presente só na sublista que
                de fato colapsa — senão o cabeçalho encolhe quando os dados
                chegam. */}
            {collapsed && (
               <div className="h-3 w-3 shrink-0 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            )}
         </div>
         {cards > 0 && (
            <div className="flex flex-col gap-1.5">
               {Array.from({ length: cards }).map((_, i) => (
                  <CardSkeleton key={i} />
               ))}
            </div>
         )}
      </div>
   );
}

/**
 * Espelha a anatomia do TripCard: índice + trigrama numa única linha à
 * esquerda (não duas empilhadas) e os DOIS chips à direita, nas larguras
 * reais (`w-10` de quadrinhos e `w-14` de horas).
 */
function CardSkeleton() {
   return (
      <div className="flex items-start justify-between gap-2 rounded border border-slate-400 bg-white p-3">
         <div className="flex min-w-0 items-baseline gap-2">
            <div className="h-2.5 w-4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
         </div>
         <div className="flex shrink-0 items-center gap-1">
            <div className="h-4 w-10 animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none" />
            <div className="h-4 w-14 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
         </div>
      </div>
   );
}
