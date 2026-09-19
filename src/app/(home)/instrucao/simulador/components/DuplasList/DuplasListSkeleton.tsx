import clsx from "clsx";

const DUPLAS_SKELETON = [0, 1, 2, 3, 4, 5];

function Bar({ className }: { className?: string }) {
   return (
      <div className={clsx("animate-pulse rounded bg-slate-200", className)} />
   );
}

/**
 * So o cabecalho: a listagem carrega com todas as duplas colapsadas, entao
 * desenhar as tabelas aqui prometeria um layout que nao vem.
 */
function DuplaCardSkeleton() {
   return (
      <div className="mx-0.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow">
         <div className="flex items-center gap-2 bg-white py-2.5 pr-1.5 pl-3">
            {/* Periodo, observacao, dupla, total e chevron — a mesma ordem
                do cabecalho real. */}
            <Bar className="hidden h-4 w-20 shrink-0 bg-slate-100 sm:block" />
            <Bar className="h-5 w-28 shrink rounded-full sm:w-40" />
            <Bar className="h-5 min-w-0 flex-1" />
            <Bar className="h-5 w-14 shrink-0 bg-slate-100" />
            <Bar className="h-4 w-4 shrink-0 bg-slate-100" />
         </div>
      </div>
   );
}

export function DuplasListSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando duplas e sessões"
         className="space-y-2"
      >
         {DUPLAS_SKELETON.map((item) => (
            <DuplaCardSkeleton key={item} />
         ))}
      </div>
   );
}
