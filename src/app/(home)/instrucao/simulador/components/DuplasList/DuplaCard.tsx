"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Badge, Button, Table, TableBody } from "flowbite-react";
import {
   HiCalendar,
   HiChevronDown,
   HiClock,
   HiPlus,
   HiTrash,
} from "react-icons/hi";
import { MdFlightTakeoff } from "react-icons/md";
import {
   isoDateToShort,
   isoDateToString,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { Dupla } from "../../types";
import { formatPilotNames, sortEtapas } from "../../helpers/sessoes";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { SessaoRow } from "./SessaoRow";

interface DuplaCardProps {
   dupla: Dupla;
   onDeleteDupla: (dupla: Dupla) => void;
   isDeletingDupla: boolean;
}

export function DuplaCard({
   dupla,
   onDeleteDupla,
   isDeletingDupla,
}: DuplaCardProps) {
   const router = useRouter();
   const [confirmDelete, setConfirmDelete] = useState(false);
   const [aberto, setAberto] = useState(false);
   const painelId = `dupla-${dupla.missaoId}-sessoes`;
   const hasSessoes = dupla.etapas.length > 0;
   const pilotNames = formatPilotNames(dupla.pilots);
   const totalTvoo = dupla.etapas.reduce((soma, etapa) => soma + etapa.tvoo, 0);
   // sortEtapas ja ordena por data+dep; as pontas dao o periodo da dupla.
   const ordenadas = sortEtapas(dupla.etapas);
   const primeira = ordenadas[0]?.data;
   const ultima = ordenadas.at(-1)?.data;

   function handleSessaoClick(etapa: EtapaItem) {
      router.push(
         `/instrucao/simulador/missao/${dupla.missaoId}?etapa=${etapa.id}`
      );
   }

   return (
      <>
         <article className="mx-0.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow">
            <div
               className={clsx(
                  "relative flex items-center gap-2 bg-white py-2.5 pr-1.5 pl-3",
                  // Com sessoes a divisoria e do painel (border-t), que entra
                  // junto da animacao; aqui so o estado vazio precisa dela.
                  !hasSessoes && "border-b border-slate-200"
               )}
            >
               {/* Cobre a faixa inteira em vez de envolve-la: a lixeira fica
                   por cima (z-10), sem aninhar botao dentro de botao. O h2 em
                   volta da o indice do leitor de tela pular de card em card. */}
               {hasSessoes && (
                  <h2 className="contents">
                     <button
                        type="button"
                        onClick={() => setAberto((visivel) => !visivel)}
                        aria-expanded={aberto}
                        aria-controls={painelId}
                        aria-label={`${aberto ? "Recolher" : "Expandir"} sessões de ${pilotNames}`}
                        className="focus-visible:outline-primary-500 absolute inset-0 cursor-pointer rounded-t-md focus-visible:outline-2 focus-visible:-outline-offset-2"
                     />
                  </h2>
               )}

               {hasSessoes && primeira && ultima && (
                  <span
                     className="hidden shrink-0 items-center gap-1 font-mono text-xs text-slate-500 tabular-nums sm:flex"
                     title={
                        primeira === ultima
                           ? `Sessão única em ${isoDateToString(primeira)}`
                           : `De ${isoDateToString(primeira)} a ${isoDateToString(ultima)}`
                     }
                  >
                     <HiCalendar
                        aria-hidden
                        className="h-4 w-4 text-slate-400"
                     />
                     {primeira === ultima
                        ? isoDateToShort(primeira)
                        : `${isoDateToShort(primeira)}–${isoDateToShort(ultima)}`}
                  </span>
               )}

               {dupla.obs && (
                  <span
                     className="max-w-48 shrink truncate rounded-full border border-yellow-300 bg-yellow-100/80 px-4 py-0.5 text-xs font-semibold text-yellow-800 sm:max-w-80"
                     title={dupla.obs}
                  >
                     {dupla.obs}
                  </span>
               )}

               <span
                  className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 uppercase"
                  title={pilotNames}
               >
                  {pilotNames}
               </span>

               {hasSessoes && (
                  <span
                     className="flex shrink-0 items-center gap-1 font-mono text-sm font-semibold text-slate-700 tabular-nums"
                     title={`Total de ${dupla.etapas.length} ${
                        dupla.etapas.length === 1 ? "sessão" : "sessões"
                     }`}
                  >
                     <HiClock aria-hidden className="h-4 w-4 text-blue-600" />
                     {minutesToTime(totalTvoo)}
                  </span>
               )}

               {hasSessoes && (
                  <HiChevronDown
                     aria-hidden
                     className={clsx(
                        "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ease-out motion-reduce:transition-none",
                        aberto && "rotate-180"
                     )}
                  />
               )}

               {/* Sem sessoes a dupla ainda pode ser desfeita; com sessoes,
                   a exclusao passa a ser do editor, sessao a sessao. */}
               {!hasSessoes && (
                  <>
                     <Badge color="warning" size="sm" className="shrink-0">
                        SEM SESSÕES
                     </Badge>
                     <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        disabled={isDeletingDupla}
                        aria-label={`Excluir dupla ${pilotNames}`}
                        title="Excluir dupla"
                        className="relative z-10 ml-auto grid size-[24px] shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-red-50/80 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        <HiTrash className="h-4 w-4" />
                     </button>
                  </>
               )}
            </div>

            {hasSessoes ? (
               <div
                  id={painelId}
                  // Altura 0 nao tira do Tab: sem `inert`, os botoes de editar
                  // sessao continuariam focaveis com o painel fechado.
                  inert={!aberto}
                  className={clsx(
                     "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                     aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
               >
                  {/* overflow-hidden corta o conteudo durante a animacao; a
                      rolagem horizontal da tabela fica na camada de dentro. */}
                  <div className="overflow-hidden">
                     <div className="overflow-x-auto border-t border-slate-200">
                        <Table
                           hoverable
                           className="text-center"
                           theme={{
                              body: {
                                 cell: { base: "px-1 py-0.5 align-middle" },
                              },
                           }}
                        >
                           <TableBody className="divide-y">
                              {ordenadas.map((etapa) => (
                                 <SessaoRow
                                    key={etapa.id}
                                    etapa={etapa}
                                    onClick={handleSessaoClick}
                                 />
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-gray-500">
                  <MdFlightTakeoff className="h-8 w-8 text-gray-300" />
                  <p className="text-sm">Nenhuma sessão registrada</p>
                  <Button
                     color="light"
                     size="sm"
                     onClick={() =>
                        router.push(
                           `/instrucao/simulador/missao/${dupla.missaoId}`
                        )
                     }
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Adicionar primeira sessão
                  </Button>
               </div>
            )}
         </article>

         <ConfirmDeleteModal
            show={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() => {
               onDeleteDupla(dupla);
               setConfirmDelete(false);
            }}
            title="Excluir dupla?"
            description="A dupla será removida. Esta ação não pode ser desfeita."
         />
      </>
   );
}
