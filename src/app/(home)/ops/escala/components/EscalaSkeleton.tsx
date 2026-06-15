import clsx from "clsx";

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

         <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-3 pl-7">
            <div className="flex items-center gap-2">
               <div className="h-3 w-5 animate-pulse rounded bg-slate-200" />
               <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
               <div className="h-3 w-8 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-200" />
               <div className="h-3 w-4 animate-pulse rounded bg-slate-200" />
               <div className="h-2 w-2 animate-pulse rounded-full bg-rose-200" />
               <div className="h-3 w-4 animate-pulse rounded bg-slate-200" />
            </div>
         </header>

         <div className="space-y-5 px-4 py-4 pl-6">
            <SubListSkeleton accent="bg-emerald-300" cards={cardsPerSubList} />
            <SubListSkeleton accent="bg-rose-300" cards={1} muted />
         </div>
      </section>
   );
}

function SubListSkeleton({
   accent,
   cards,
   muted = false,
}: {
   accent: string;
   cards: number;
   muted?: boolean;
}) {
   return (
      <div>
         <div className="mb-2 flex items-center gap-2">
            <span
               className={`inline-block h-2 w-2 animate-pulse rounded-full ${accent}`}
            />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-2.5 w-5 animate-pulse rounded bg-slate-200" />
            <div className="ml-1 h-px flex-1 bg-slate-200" />
         </div>
         <div className="flex flex-col gap-1.5">
            {Array.from({ length: cards }).map((_, i) => (
               <CardSkeleton key={i} muted={muted} />
            ))}
         </div>
      </div>
   );
}

function CardSkeleton({ muted = false }: { muted?: boolean }) {
   return (
      <div
         className={clsx(
            "flex items-start justify-between gap-2 rounded border border-slate-200 bg-white p-3",
            muted && "opacity-70"
         )}
      >
         <div className="flex min-w-0 items-baseline gap-2">
            <div className="h-2.5 w-4 animate-pulse rounded bg-slate-200" />
            <div className="flex flex-col gap-1.5">
               <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
               <div className="h-2 w-10 animate-pulse rounded bg-slate-100" />
            </div>
         </div>
         <div className="h-4 w-12 animate-pulse rounded-md bg-slate-200" />
      </div>
   );
}
