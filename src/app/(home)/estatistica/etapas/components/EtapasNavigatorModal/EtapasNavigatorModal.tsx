"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "flowbite-react";
import { HiPencilAlt, HiX } from "react-icons/hi";
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

   // Keyboard navigation
   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
         const currentIndex = etapas.findIndex((et) => et.id === selectedId);
         if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = etapas[currentIndex + 1];
            if (next) setSelectedId(next.id);
         } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = etapas[currentIndex - 1];
            if (prev) setSelectedId(prev.id);
         }
      },
      [etapas, selectedId]
   );

   return (
      <Modal show onClose={onClose} dismissible size="7xl" popup>
         <div
            className="flex h-[90vh] overflow-hidden rounded-lg"
            onKeyDown={handleKeyDown}
         >
            {/* Sidebar */}
            <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white xl:w-72">
               {/* Sidebar header */}
               <div className="shrink-0 border-b border-slate-200 px-4 py-3">
                  <p
                     className="truncate text-sm font-semibold text-slate-800"
                     title={missaoTitulo ?? undefined}
                  >
                     {missaoTitulo ?? "Etapas da Missão"}
                  </p>
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

                           {/* Row 3: times + tvoo */}
                           <p className="mt-0.5 font-mono text-xs text-slate-500">
                              {formatTime(etapa.dep)}Z → {formatTime(etapa.arr)}
                              Z &bull; {minutesToTime(etapa.tvoo)}
                           </p>
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Detail panel */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
               {/* Edit + close buttons */}
               <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                  <PermBased resource="etp_mis" requiredPerm="create">
                     <button
                        onClick={() => onEditEtapa(selectedId)}
                        title="Editar etapa"
                        className="rounded-lg p-1.5 transition-colors hover:bg-slate-200"
                     >
                        <HiPencilAlt className="h-5 w-5 text-slate-600" />
                     </button>
                  </PermBased>
                  <button
                     onClick={onClose}
                     title="Fechar"
                     className="rounded-lg p-1.5 transition-colors hover:bg-slate-200"
                  >
                     <HiX className="h-5 w-5 text-slate-600" />
                  </button>
               </div>

               {/* overflow-hidden contém o scroll interno do EtapaDetailContent (flex-1 overflow-y-auto) */}
               <div className="flex-1 overflow-hidden">
                  <EtapaDetailContent etapaId={selectedId} />
               </div>
            </div>
         </div>
      </Modal>
   );
}
