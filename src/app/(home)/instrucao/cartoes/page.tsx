"use client";

import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { HiX } from "react-icons/hi";
import { useCartoes } from "@/hooks/queries";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import { DOC_FIELDS, STATUS_LABELS } from "./cartoes.config";
import {
   applyFiltro,
   computeDocStats,
   parseFiltro,
   type CartaoFiltro,
} from "./utils/cartaoStats";
import CartoesMasthead from "./components/CartoesMasthead";
import SummaryBar from "./components/SummaryBar";
import SummaryBarSkeleton from "./components/SummaryBarSkeleton";
import PilotCard from "./components/PilotCard";
import PilotCardSkeleton from "./components/PilotCardSkeleton";
import EditCartoesModal from "./components/EditCartoesModal";
import OrfaosAlert from "./components/OrfaosAlert";
import { PermBased } from "../../hooks/usePermBased";

const SKELETON_ROWS = 8;

export default function CartoesPage() {
   const [editItem, setEditItem] = useState<TripCartoesOut | null>(null);
   // Piloto editado sob um recorte: continua na lista mesmo que a edição o
   // tire do recorte. Sem isso o card desmonta no refetch e o foco, que o
   // modal devolveu ao botão Editar dele, cai no <body>. Vale até o recorte
   // mudar.
   const [fixadoId, setFixadoId] = useState<number | null>(null);
   const { searchParams, setParams } = useSearchParamsUpdater();

   const { data, isLoading, isError, error, refetch, isFetching } =
      useCartoes();

   const pilotos = useMemo(() => data ?? [], [data]);
   const stats = useMemo(() => computeDocStats(pilotos), [pilotos]);

   // Recorte vindo dos contadores do resumo, guardado na URL para sobreviver
   // a recarregar e compartilhar o link. Par inválido cai em "sem recorte".
   const docParam = searchParams.get("doc");
   const statusParam = searchParams.get("status");
   const filtro = useMemo(
      () => parseFiltro(docParam, statusParam),
      [docParam, statusParam]
   );
   const filtrados = useMemo(
      () => applyFiltro(pilotos, filtro),
      [pilotos, filtro]
   );
   // O contador de "N de M" usa `filtrados` (o que o recorte conta); a lista
   // usa `visiveis`, que acrescenta o piloto fixado na posição dele.
   const visiveis = useMemo(() => {
      if (!filtro || fixadoId === null) return filtrados;
      const noRecorte = new Set(filtrados);
      return pilotos.filter((p) => noRecorte.has(p) || p.trip_id === fixadoId);
   }, [pilotos, filtrados, filtro, fixadoId]);

   const handleEdit = useCallback((p: TripCartoesOut) => {
      setEditItem(p);
      setFixadoId(p.trip_id);
   }, []);

   const handleFiltroChange = useCallback(
      (next: CartaoFiltro | null) => {
         setFixadoId(null);
         setParams({ doc: next?.doc, status: next?.status });
      },
      [setParams]
   );
   const clearFiltro = () => handleFiltroChange(null);

   const filtroDoc = filtro
      ? DOC_FIELDS.find((f) => f.key === filtro.doc)
      : undefined;
   // Esmaece só com dado em tela; a primeira carga é do skeleton.
   const refetching = isFetching && !isLoading;

   return (
      <div className="flex flex-col space-y-2">
         <CartoesMasthead count={data ? data.length : null} />

         {/* Documentos de inativos (gated por permissão de remoção) */}
         <PermBased resource="instrucao.cartoes" requiredPerm="delete">
            <OrfaosAlert />
         </PermBased>

         {isLoading ? (
            <>
               <SummaryBarSkeleton />
               <div role="status" className="flex flex-col gap-1.5">
                  <span className="sr-only">
                     Carregando cartões dos pilotos…
                  </span>
                  {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                     <PilotCardSkeleton key={i} />
                  ))}
               </div>
            </>
         ) : isError && !data ? (
            <div
               role="alert"
               className="rounded border border-red-200 bg-red-50 px-4 py-12 text-center"
            >
               <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar os cartões
               </p>
               <p className="mt-1 text-xs text-red-600">
                  {error instanceof Error ? error.message : "Tente novamente."}
               </p>
               <div className="mt-4 flex justify-center">
                  <Button
                     color="light"
                     size="sm"
                     onClick={() => refetch()}
                     disabled={isFetching}
                  >
                     Tentar novamente
                  </Button>
               </div>
            </div>
         ) : pilotos.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum piloto encontrado
               </p>
            </div>
         ) : (
            <>
               {/* Falha num refetch com dado em cache: mantém a lista e avisa. */}
               {isError && (
                  <div
                     role="status"
                     className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                  >
                     <span>
                        Não foi possível atualizar os cartões. Exibindo a última
                        consulta.
                     </span>
                     <Button
                        color="light"
                        size="xs"
                        onClick={() => refetch()}
                        disabled={isFetching}
                     >
                        Tentar novamente
                     </Button>
                  </div>
               )}

               <div
                  className={clsx(
                     "transition-opacity",
                     refetching && "opacity-50"
                  )}
               >
                  <SummaryBar
                     stats={stats}
                     filtro={filtro}
                     onFiltroChange={handleFiltroChange}
                  />
               </div>

               {/* Região viva sempre montada: inserida já preenchida, a
                   maioria dos leitores não anunciaria o primeiro recorte. */}
               <p role="status" className="sr-only">
                  {filtro && filtroDoc
                     ? `${filtrados.length} de ${pilotos.length} pilotos · ${filtroDoc.nome}: ${STATUS_LABELS[filtro.status]}`
                     : ""}
               </p>

               {filtro && filtroDoc && (
                  <div className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">
                     <span className="min-w-0">
                        <strong className="tabular-nums">
                           {filtrados.length}
                        </strong>{" "}
                        de {pilotos.length} ·{" "}
                        <span className="font-medium">
                           {filtroDoc.nome}: {STATUS_LABELS[filtro.status]}
                        </span>
                     </span>
                     <Button color="light" size="xs" onClick={clearFiltro}>
                        <HiX className="h-3.5 w-3.5 sm:mr-1" />
                        <span className="sr-only sm:not-sr-only">
                           Limpar filtro
                        </span>
                     </Button>
                  </div>
               )}

               {visiveis.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
                     <p className="text-sm font-semibold text-slate-600">
                        Nenhum piloto neste recorte
                     </p>
                  </div>
               ) : (
                  <div
                     className={clsx(
                        "flex flex-col gap-1.5 transition-opacity",
                        refetching && "opacity-50"
                     )}
                  >
                     {visiveis.map((p) => (
                        <PilotCard
                           key={p.trip_id}
                           pilot={p}
                           onEdit={handleEdit}
                        />
                     ))}
                  </div>
               )}
            </>
         )}

         {editItem && (
            <EditCartoesModal
               show={!!editItem}
               onClose={() => setEditItem(null)}
               item={editItem}
            />
         )}
      </div>
   );
}
