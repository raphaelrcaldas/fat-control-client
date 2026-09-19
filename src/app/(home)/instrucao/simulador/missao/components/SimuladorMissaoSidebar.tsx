"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

import {
   formatDateFull,
   formatTime,
   isoDateToShort,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";

interface SimuladorMissaoSidebarProps {
   obsId: string;
   pilotNames: string;
   /** Ano da listagem; sessao fora dele some do filtro e fica invisivel la. */
   anoRef: number;
   etapas: EtapaItem[];
   selectedEtapaId: number | null;
   obs: string;
   obsDirty: boolean;
   canCreate: boolean;
   onObsChange: (value: string) => void;
   onSelectEtapa: (etapaId: number) => void;
   onAddEtapa: () => void;
}

export function SimuladorMissaoSidebar({
   obsId,
   pilotNames,
   anoRef,
   etapas,
   selectedEtapaId,
   obs,
   obsDirty,
   canCreate,
   onObsChange,
   onSelectEtapa,
   onAddEtapa,
}: SimuladorMissaoSidebarProps) {
   return (
      <aside
         aria-label="Painel da missão de simulador"
         className="flex h-full max-w-80 flex-col border-r border-gray-200 bg-gray-50"
      >
         <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-2">
               <div className="min-w-0">
                  <h2
                     className="truncate text-center text-base font-semibold text-gray-900 uppercase"
                     title={pilotNames}
                  >
                     {pilotNames}
                  </h2>
               </div>
               <label htmlFor={obsId} className="sr-only">
                  Observações da missão
               </label>
               <textarea
                  id={obsId}
                  value={obs}
                  onChange={(event) => onObsChange(event.target.value)}
                  placeholder="Observações da missão (opcional)"
                  rows={2}
                  className="focus:border-primary-400 focus:ring-primary-400 w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
               />
               {obsDirty && (
                  <p className="text-xs text-amber-700">
                     Será salva junto da sessão.
                  </p>
               )}
            </div>
            {canCreate && (
               <Button
                  color="primary"
                  size="sm"
                  onClick={onAddEtapa}
                  className="w-full"
               >
                  <HiPlus className="mr-1 h-4 w-4" />
                  Nova sessão
               </Button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)] p-3">
            {etapas.length === 0 ? (
               <p className="px-2 py-6 text-center text-sm text-gray-500">
                  Nenhuma sessão adicionada.
               </p>
            ) : (
               <ul className="flex flex-col gap-2">
                  {etapas.map((etapa, index) => {
                     const selected = etapa.id === selectedEtapaId;
                     // Ano errado (digitacao) tira a sessao da listagem e
                     // bagunca a ordem; aqui ela fica visivel e sinalizada.
                     const foraDoAno =
                        !!etapa.data &&
                        etapa.data.slice(0, 4) !== String(anoRef);
                     return (
                        <li key={etapa.id}>
                           <button
                              type="button"
                              onClick={() => onSelectEtapa(etapa.id)}
                              aria-current={selected ? "true" : undefined}
                              className={clsx(
                                 "relative flex w-full flex-col gap-1 overflow-hidden border border-gray-200 bg-white p-3 pl-4 text-left shadow transition",
                                 "focus-visible:outline-primary-500 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2",
                                 selected &&
                                    "border-primary-200 bg-primary-50/40 hover:bg-primary-50/60",
                                 // Barra de acento no ::before, para nao deslocar o layout
                                 "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:transition",
                                 selected
                                    ? "before:bg-primary-500"
                                    : "before:bg-transparent",
                                 foraDoAno &&
                                    !selected &&
                                    "border-amber-300 bg-amber-50/60"
                              )}
                           >
                              <div className="flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-900">
                                 {/* No mobile o card e a unica pista de qual
                                     sessao e qual — o titulo do header nao
                                     aparece junto do drawer */}
                                 <span className="mr-0.5 shrink-0 font-mono text-xs text-gray-500">
                                    {String(index + 1).padStart(2, "0")}
                                 </span>
                                 <span className="truncate font-mono">
                                    {etapa.origem}
                                 </span>
                                 <span className="shrink-0 text-gray-400">
                                    →
                                 </span>
                                 <span className="truncate font-mono">
                                    {etapa.destino}
                                 </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                                 <span
                                    className="truncate text-gray-500"
                                    title={
                                       etapa.data
                                          ? formatDateFull(etapa.data)
                                          : undefined
                                    }
                                 >
                                    {etapa.data
                                       ? isoDateToShort(etapa.data)
                                       : "--/--"}
                                    {foraDoAno && (
                                       <span
                                          className="ml-1 font-semibold text-amber-700"
                                          title={`Ano ${etapa.data.slice(0, 4)} fora da referência (${anoRef}) — corrija a data`}
                                       >
                                          /{etapa.data.slice(0, 4)}
                                       </span>
                                    )}
                                    <span className="mx-1 text-gray-300">
                                       ·
                                    </span>
                                    {formatTime(etapa.dep)}–
                                    {formatTime(etapa.arr)}
                                 </span>
                                 <span className="shrink-0 font-mono text-sm font-semibold text-gray-900">
                                    {minutesToTime(etapa.tvoo)}
                                 </span>
                              </div>
                           </button>
                        </li>
                     );
                  })}
               </ul>
            )}
         </div>
      </aside>
   );
}
