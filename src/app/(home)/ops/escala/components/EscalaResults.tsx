import clsx from "clsx";
import { FuncSection } from "./FuncSection";
import { EmptyState, NoResultsState } from "./EmptyState";
import { EscalaSkeleton } from "./EscalaSkeleton";
import type { SectionBucket } from "../types";

interface EscalaResultsProps {
   isParamsReady: boolean;
   showSkeleton: boolean;
   isFetching: boolean;
   hasData: boolean;
   buckets: SectionBucket[];
   skeletonColumns: number;
}

export function EscalaResults({
   isParamsReady,
   showSkeleton,
   isFetching,
   hasData,
   buckets,
   skeletonColumns,
}: EscalaResultsProps) {
   if (!isParamsReady) return <EmptyState />;
   if (showSkeleton) return <EscalaSkeleton columns={skeletonColumns} />;

   // O backend devolve SEMPRE uma seção por função pedida, e a página só
   // consulta com `funcs` não-vazio — então `buckets.length === 0` (a condição
   // anterior) nunca acontecia e este estado era inalcançável. O "nada
   // encontrado" de verdade é toda seção vir vazia; sem isto a tela mostrava N
   // colunas, cada uma repetindo dois vazios.
   // (`every` em array vazio é `true`, então isto também cobre o caso antigo.)
   if (hasData && buckets.every((b) => b.total === 0))
      return <NoResultsState />;

   return (
      <div
         className={clsx(
            "flex flex-wrap items-start gap-4 transition-opacity",
            isFetching && "opacity-50"
         )}
      >
         {buckets.map((bucket, idx) => (
            <FuncSection key={bucket.func} bucket={bucket} index={idx + 1} />
         ))}
      </div>
   );
}
