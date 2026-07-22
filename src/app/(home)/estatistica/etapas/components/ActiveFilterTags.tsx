"use client";

import { Badge } from "flowbite-react";
import { MdBarChart, MdFlightTakeoff, MdFlightLand } from "react-icons/md";
import { HiCalendar, HiX, HiUser } from "react-icons/hi";
import { formatDateFull } from "@/../utils/dateHandler";

interface ActiveFilterTagsProps {
   urlDataIni: string;
   urlDataFim: string;
   urlAnv: string[];
   urlOrigem: string;
   urlDestino: string;
   urlTrip: string;
   urlFuncao: string;
   urlEsfAer: string;
   urlTipoMissao: string[];
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
   urlDataIni,
   urlDataFim,
   urlAnv,
   urlOrigem,
   urlDestino,
   urlTrip,
   urlFuncao,
   urlEsfAer,
   urlTipoMissao,
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
   // Deriva dos próprios props se há algum filtro visível — sem filtro, o bloco
   // não monta (antes ficava só "Filtros ativos:/Limpar todos" pendurado).
   const hasActiveFilters = Boolean(
      urlDataIni ||
      urlDataFim ||
      urlAnv.length ||
      urlOrigem ||
      urlDestino ||
      urlTrip ||
      urlEsfAer ||
      urlTipoMissao.length
   );

   if (!hasActiveFilters) return null;

   return (
      // Ocultos no mobile (chips quebravam em várias linhas): o badge de
      // contagem no botão "Filtros" já sinaliza filtros ativos. Reaparecem no sm+.
      <div className="mb-1 ml-1 hidden shrink-0 flex-wrap items-center gap-2 sm:flex">
         <span className="text-xs font-medium text-gray-600">
            Filtros ativos:
         </span>

         {urlDataIni && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>De: {formatDateFull(urlDataIni)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data inicial"
                     onClick={onRemoveDataIni}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlDataFim && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Ate: {formatDateFull(urlDataFim)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data final"
                     onClick={onRemoveDataFim}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
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
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
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
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
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
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
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
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTrip && urlFuncao && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <span>Funcao: {urlFuncao.toUpperCase()}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro funcao"
                     onClick={onRemoveFuncao}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlEsfAer && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <MdBarChart className="h-3 w-3" />
                  <span>ESF: {urlEsfAer}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro esforco aereo"
                     onClick={onRemoveEsfAer}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTipoMissao.length > 0 && (
            <Badge color="primary">
               <div className="flex items-center gap-1.5">
                  <span>Tipo Missao: {urlTipoMissao.join(", ")}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro tipo missao"
                     onClick={onRemoveTipoMissao}
                     className="hover:text-primary-900 -my-2 ml-0.5 grid size-[26px] shrink-0 place-items-center rounded pointer-coarse:size-[44px]"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         <button
            type="button"
            onClick={onClearAll}
            className="-my-2 rounded px-1 py-2 text-xs text-gray-500 underline hover:text-gray-700 pointer-coarse:min-h-[44px]"
         >
            Limpar todos
         </button>
      </div>
   );
}
