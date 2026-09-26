"use client";

import { Badge } from "flowbite-react";
import { MdBarChart, MdFlightTakeoff, MdFlightLand } from "react-icons/md";
import { HiCalendar, HiX, HiUser } from "react-icons/hi";
import { formatDateFull } from "@/../utils/dateHandler";

interface SelectOption {
   value: string;
   label: string;
}

interface ActiveFilterTagsProps {
   hasActiveFilters: boolean;
   dataIniActive: boolean;
   dataFimActive: boolean;
   urlDataIni: string;
   urlDataFim: string;
   urlAnv: string[];
   urlOrigem: string;
   urlDestino: string;
   urlTrip: string;
   urlFuncao: string;
   urlEsfAerId: string;
   urlTipoMissao: string[];
   esfAerOptions: SelectOption[];
   onRemoveDataIni: () => void;
   onRemoveDataFim: () => void;
   onRemoveAnv: () => void;
   onRemoveOrigem: () => void;
   onRemoveDestino: () => void;
   onRemoveTrip: () => void;
   onRemoveFuncao: () => void;
   onRemoveEsfAer: () => void;
   onRemoveTipoMissao: () => void;
   onClearAll: () => void;
}

export function ActiveFilterTags({
   hasActiveFilters,
   dataIniActive,
   dataFimActive,
   urlDataIni,
   urlDataFim,
   urlAnv,
   urlOrigem,
   urlDestino,
   urlTrip,
   urlFuncao,
   urlEsfAerId,
   urlTipoMissao,
   esfAerOptions,
   onRemoveDataIni,
   onRemoveDataFim,
   onRemoveAnv,
   onRemoveOrigem,
   onRemoveDestino,
   onRemoveTrip,
   onRemoveFuncao,
   onRemoveEsfAer,
   onRemoveTipoMissao,
   onClearAll,
}: ActiveFilterTagsProps) {
   // Fonte única de "há filtro ativo": o hook já computa isto para o badge do
   // botão Filtros (que ignora datas default). Repetir a lista de condições
   // aqui divergia — as datas sempre existem na URL (seed default), então uma
   // checagem local por `urlDataIni`/`urlDataFim` truthy dava sempre true.
   if (!hasActiveFilters) return null;

   const esfAerLabel = urlEsfAerId
      ? (esfAerOptions.find((o) => o.value === urlEsfAerId)?.label ??
        `#${urlEsfAerId}`)
      : "";

   return (
      // Ocultos no mobile (chips quebravam em várias linhas): o badge de
      // contagem no botão "Filtros" já sinaliza filtros ativos. Reaparecem no sm+.
      <div className="ml-1 hidden shrink-0 flex-wrap items-center gap-2 sm:flex">
         <span className="text-xs font-medium text-gray-600">
            Filtros ativos:
         </span>

         {dataIniActive && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>De: {formatDateFull(urlDataIni)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data inicial"
                     onClick={onRemoveDataIni}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {dataFimActive && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Até: {formatDateFull(urlDataFim)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data final"
                     onClick={onRemoveDataFim}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlAnv.length > 0 && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <MdFlightTakeoff className="h-3 w-3" />
                  <span>Aeronave: {urlAnv.join(", ")}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro aeronave"
                     onClick={onRemoveAnv}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlOrigem && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <MdFlightTakeoff className="h-3 w-3" />
                  <span>Origem: {urlOrigem}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro origem"
                     onClick={onRemoveOrigem}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlDestino && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <MdFlightLand className="h-3 w-3" />
                  <span>Destino: {urlDestino}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro destino"
                     onClick={onRemoveDestino}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTrip && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiUser className="h-3 w-3" />
                  <span>Tripulante: {urlTrip}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro tripulante"
                     onClick={onRemoveTrip}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTrip && urlFuncao && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <span>Função: {urlFuncao.toUpperCase()}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro função"
                     onClick={onRemoveFuncao}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlEsfAerId && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <MdBarChart className="h-3 w-3" />
                  <span>ESF: {esfAerLabel}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro esforço aéreo"
                     onClick={onRemoveEsfAer}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTipoMissao.length > 0 && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <span>Tipo de missão: {urlTipoMissao.join(", ")}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro tipo missão"
                     onClick={onRemoveTipoMissao}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         <button
            type="button"
            onClick={onClearAll}
            className="-my-2 rounded px-1 py-2 text-xs text-gray-500 underline hover:text-gray-700"
         >
            Limpar todos
         </button>
      </div>
   );
}
