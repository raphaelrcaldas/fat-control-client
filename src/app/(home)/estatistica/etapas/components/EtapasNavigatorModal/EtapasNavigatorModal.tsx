"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "flowbite-react";
import {
   HiChevronLeft,
   HiChevronRight,
   HiPencilAlt,
   HiX,
} from "react-icons/hi";
import clsx from "clsx";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import {
   isoDateToString,
   minutesToTime,
   formatTime,
} from "@/../utils/dateHandler";
import { EtapaDetailContent } from "../EtapaDetail/EtapaDetailContent";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface EtapasNavigatorModalProps {
   etapas: EtapaItem[];
   initialEtapaId: number;
   onClose: () => void;
   missaoTitulo?: string | null;
   onEditEtapa: (id: number) => void;
}

export function EtapasNavigatorModal({
   etapas,
   initialEtapaId,
   onClose,
   missaoTitulo,
   onEditEtapa,
}: EtapasNavigatorModalProps) {
   const [selectedId, setSelectedId] = useState<number>(initialEtapaId);
   const selectedRef = useRef<HTMLButtonElement | null>(null);
   const listRef = useRef<HTMLDivElement | null>(null);

   // Scroll selected item into view when selection changes
   useEffect(() => {
      selectedRef.current?.scrollIntoView({ block: "nearest" });
   }, [selectedId]);

   const currentIndex = etapas.findIndex((et) => et.id === selectedId);
   const selecionada = etapas[currentIndex];
   const anterior = etapas[currentIndex - 1];
   const proxima = etapas[currentIndex + 1];
   const titulo = missaoTitulo ?? "Etapas da Missão";

   // Keyboard navigation
   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
         if (e.key === "ArrowDown") {
            e.preventDefault();
            if (proxima) setSelectedId(proxima.id);
         } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (anterior) setSelectedId(anterior.id);
         }
      },
      [anterior, proxima]
   );

   const acoes = (
      <>
         <PermBased resource="etp_mis" requiredPerm="create">
            <button
               onClick={() => onEditEtapa(selectedId)}
               title="Editar etapa"
               aria-label="Editar etapa"
               className="grid size-7 shrink-0 place-items-center rounded transition-colors hover:bg-slate-200 pointer-coarse:size-[44px]"
            >
               <HiPencilAlt className="h-5 w-5 text-slate-600" />
            </button>
         </PermBased>
         <button
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar detalhes da etapa"
            className="grid size-7 shrink-0 place-items-center rounded transition-colors hover:bg-slate-200 pointer-coarse:size-[44px]"
         >
            <HiX className="h-5 w-5 text-slate-600" />
         </button>
      </>
   );

   return (
      <Modal
         show
         onClose={onClose}
         dismissible
         size="7xl"
         popup
         aria-label={`Detalhes das etapas — ${titulo}`}
         // Tela cheia no mobile: o `p-4` do content default descontava 28px de
         // largura num painel que ja estava espremido, e o `max-h-[90dvh]`
         // deixava 80px de altura sem uso.
         theme={{
            content: {
               base: "relative h-full w-full p-0 sm:p-4 md:h-auto",
               inner: "max-h-[100dvh] rounded-none sm:max-h-[90dvh] sm:rounded",
            },
         }}
      >
         <div
            className="flex h-[100dvh] overflow-hidden sm:h-[90vh] sm:rounded"
            onKeyDown={handleKeyDown}
         >
            {/* Trilha de etapas — so a partir de lg. Abaixo disso ela comia
                224px dos 332px disponiveis e sobrava um tubo de 108px para o
                detalhe, que ficava recortado (o destino do voo caia 158px fora
                da area visivel, sem scroll que o alcancasse). */}
            <div className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex xl:w-72">
               {/* Sidebar header */}
               <div className="shrink-0 border-b border-slate-200 px-4 py-3">
                  <h2
                     className="truncate text-sm font-semibold text-slate-800"
                     title={missaoTitulo ?? undefined}
                  >
                     {titulo}
                  </h2>
                  <span className="bg-primary-100 text-primary-700 mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold">
                     {etapas.length} etapa{etapas.length !== 1 ? "s" : ""}
                  </span>
               </div>

               {/* Sidebar list */}
               <div
                  ref={listRef}
                  className="flex-1 overflow-y-auto"
                  tabIndex={-1}
               >
                  {etapas.map((etapa) => {
                     const isSelected = etapa.id === selectedId;
                     return (
                        <button
                           key={etapa.id}
                           ref={isSelected ? selectedRef : null}
                           onClick={() => setSelectedId(etapa.id)}
                           className={clsx(
                              "w-full cursor-pointer border-l-2 px-3 py-1.5 text-left transition-colors",
                              isSelected
                                 ? "border-primary-500 bg-primary-100"
                                 : "border-transparent hover:bg-slate-50"
                           )}
                        >
                           {/* Row 1: date + anv */}
                           <div className="flex items-center gap-2">
                              <span className="text-primary-800 rounded text-xs font-bold">
                                 {isoDateToString(etapa.data)}
                              </span>
                              <span className="text-xs font-semibold">
                                 {etapa.anv}
                              </span>
                           </div>

                           {/* Row 2: route */}
                           <p className="mt-0.5 truncate text-sm text-slate-800">
                              {etapa.origem} → {etapa.destino}
                           </p>

                           {/* Row 3: times + tvoo.
                               slate-600 (nao 500): sobre o bg-primary-100 do
                               item selecionado o 500 reprova AA */}
                           <p className="mt-0.5 font-mono text-xs text-slate-600">
                              {formatTime(etapa.dep)}Z → {formatTime(etapa.arr)}
                              Z &bull; {minutesToTime(etapa.tvoo)}
                           </p>
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Detail panel */}
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
               {/* Cabecalho proprio abaixo de lg: substitui a trilha lateral e
                   segura os botoes, que flutuando por cima do conteudo num
                   painel estreito cobriam a linha do #id/data */}
               <div className="flex shrink-0 flex-col border-b border-slate-200 bg-white lg:hidden">
                  <div className="flex items-center gap-2 px-3 py-1.5">
                     <h2
                        className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800"
                        title={missaoTitulo ?? undefined}
                     >
                        {titulo}
                     </h2>
                     {acoes}
                  </div>

                  {/* Missao de etapa unica nao ganha navegacao nenhuma */}
                  {etapas.length > 1 && (
                     <div className="flex items-center gap-1 border-t border-slate-100 px-1.5 py-1">
                        <button
                           type="button"
                           onClick={() =>
                              anterior && setSelectedId(anterior.id)
                           }
                           disabled={!anterior}
                           aria-label="Etapa anterior"
                           className="grid size-7 shrink-0 place-items-center rounded text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 pointer-coarse:size-[44px]"
                        >
                           <HiChevronLeft className="h-5 w-5" />
                        </button>

                        {/* So a posicao: a rota do voo ja vem logo abaixo, em
                            21px, no cabecalho do proprio detalhe */}
                        <p className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-slate-700">
                           Etapa {currentIndex + 1} de {etapas.length}
                        </p>

                        <button
                           type="button"
                           onClick={() => proxima && setSelectedId(proxima.id)}
                           disabled={!proxima}
                           aria-label="Próxima etapa"
                           className="grid size-7 shrink-0 place-items-center rounded text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 pointer-coarse:size-[44px]"
                        >
                           <HiChevronRight className="h-5 w-5" />
                        </button>
                     </div>
                  )}
               </div>

               {/* A partir de lg os botoes voltam a flutuar sobre o conteudo:
                   la sobra largura e o cabeçalho da etapa nao e alcancado */}
               <div className="absolute top-3 right-3 z-10 hidden items-center gap-1 lg:flex">
                  {acoes}
               </div>

               {/* overflow-hidden contém o scroll interno do EtapaDetailContent (flex-1 overflow-y-auto) */}
               <div className="min-h-0 flex-1 overflow-hidden">
                  {selecionada && <EtapaDetailContent etapa={selecionada} />}
               </div>
            </div>
         </div>
      </Modal>
   );
}
