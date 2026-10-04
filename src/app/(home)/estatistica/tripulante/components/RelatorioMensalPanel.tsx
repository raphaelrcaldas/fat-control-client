import clsx from "clsx";
import { Alert, Button } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { ApiError } from "services/Api";
import { useRelatorioMensal } from "@/hooks/queries/useRelatorioMensal";
import { RelatorioMensalConteudo } from "./RelatorioMensalConteudo";
import { RelatorioMensalSkeleton } from "./RelatorioMensalSkeleton";

export function RelatorioMensalPanel({
   tripId,
   ano,
   mes,
   onBuscar,
}: {
   tripId: number | null;
   ano: number;
   mes: number;
   onBuscar: () => void;
}) {
   const query = useRelatorioMensal(tripId, ano, mes);
   const naoEncontrado =
      query.error instanceof ApiError && query.error.status === 404;
   return (
      <div className="min-w-0 space-y-2">
         {query.isError && !naoEncontrado && (
            <Alert color="failure">
               <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                     {query.data
                        ? "Não foi possível atualizar o relatório. Exibindo a última consulta disponível."
                        : "Não foi possível carregar o relatório mensal."}
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
         {naoEncontrado || !tripId ? (
            <div
               role={naoEncontrado ? "alert" : undefined}
               className="flex flex-col items-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600"
            >
               <p>
                  {naoEncontrado
                     ? "Tripulante não encontrado nesta organização."
                     : "Selecione um tripulante para consultar suas etapas no mês."}
               </p>
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
            <RelatorioMensalSkeleton />
         ) : query.data ? (
            <div
               aria-busy={query.isFetching}
               className={clsx(
                  "transition-opacity",
                  query.isFetching && "opacity-50"
               )}
            >
               <RelatorioMensalConteudo relatorio={query.data} />
            </div>
         ) : null}
      </div>
   );
}
