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
   return (
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
         <span className="text-xs font-medium text-gray-600">
            Filtros ativos:
         </span>

         {urlDataIni && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>De: {formatDateFull(urlDataIni)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data inicial"
                     onClick={onRemoveDataIni}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlDataFim && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <HiCalendar className="h-3 w-3" />
                  <span>Ate: {formatDateFull(urlDataFim)}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro data final"
                     onClick={onRemoveDataFim}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlAnv.length > 0 && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <MdFlightTakeoff className="h-3 w-3" />
                  <span>Aeronave: {urlAnv.join(", ")}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro aeronave"
                     onClick={onRemoveAnv}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlOrigem && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <MdFlightTakeoff className="h-3 w-3" />
                  <span>Origem: {urlOrigem}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro origem"
                     onClick={onRemoveOrigem}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlDestino && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <MdFlightLand className="h-3 w-3" />
                  <span>Destino: {urlDestino}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro destino"
                     onClick={onRemoveDestino}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTrip && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <HiUser className="h-3 w-3" />
                  <span>Tripulante: {urlTrip}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro tripulante"
                     onClick={onRemoveTrip}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTrip && urlFuncao && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <span>Funcao: {urlFuncao.toUpperCase()}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro funcao"
                     onClick={onRemoveFuncao}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlEsfAer && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <MdBarChart className="h-3 w-3" />
                  <span>ESF: {urlEsfAer}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro esforco aereo"
                     onClick={onRemoveEsfAer}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         {urlTipoMissao.length > 0 && (
            <Badge color="red">
               <div className="flex items-center gap-1.5">
                  <span>Tipo Missao: {urlTipoMissao.join(", ")}</span>
                  <button
                     type="button"
                     aria-label="Remover filtro tipo missao"
                     onClick={onRemoveTipoMissao}
                     className="ml-1 hover:text-red-600"
                  >
                     <HiX className="h-3 w-3" />
                  </button>
               </div>
            </Badge>
         )}

         <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-gray-500 underline hover:text-gray-700"
         >
            Limpar todos
         </button>
      </div>
   );
}
