import clsx from "clsx";
import { Alert, Button } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { ApiError } from "services/Api";
import { useRelatorioAnual } from "@/hooks/queries/useRelatorioAnual";
import { RelatorioConteudo } from "./RelatorioConteudo";
import { RelatorioSkeleton } from "./RelatorioSkeleton";

export function RelatorioAnualPanel({
   tripId,
   ano,
   onBuscar,
}: {
   tripId: number | null;
   ano: number;
   onBuscar: () => void;
}) {
   const query = useRelatorioAnual(tripId, ano);
   const naoEncontrado =
      query.error instanceof ApiError && query.error.status === 404;
   return (
      <div className="space-y-2">
         {query.isError && !naoEncontrado && (
            <Alert color="failure">
               <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                     {query.data
                        ? "Não foi possível atualizar o relatório. Exibindo a última consulta disponível."
                        : "Não foi possível carregar o relatório anual."}
                  </span>
                  <Button
                     color="light"
                     size="xs"
                     onClick={() => void query.refetch()}
                     disabled={query.isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            </Alert>
         )}
         {naoEncontrado ? (
            <div
               role="alert"
               className="flex flex-col items-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600"
            >
               <p>Tripulante não encontrado nesta organização.</p>
               <Button
                  color="light"
                  size="sm"
                  onClick={onBuscar}
                  className="gap-2"
               >
                  <HiOutlineSearch aria-hidden className="h-4 w-4 shrink-0" />
                  Buscar tripulante
               </Button>
            </div>
         ) : !tripId ? (
            <div className="flex flex-col items-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
               <p>Selecione um tripulante para consultar suas horas no ano.</p>
               <Button
                  color="light"
                  size="sm"
                  onClick={onBuscar}
                  className="gap-2"
               >
                  <HiOutlineSearch aria-hidden className="h-4 w-4 shrink-0" />
                  Buscar tripulante
               </Button>
            </div>
         ) : query.isLoading ? (
            <RelatorioSkeleton />
         ) : query.data ? (
            <div
               aria-busy={query.isFetching}
               className={clsx(query.isFetching && "opacity-50")}
            >
               <RelatorioConteudo relatorio={query.data} />
            </div>
         ) : null}
      </div>
   );
}
