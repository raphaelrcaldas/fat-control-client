"use client";

import { memo, useMemo } from "react";
import { HiPencilAlt, HiPlus, HiTrash } from "react-icons/hi";
import { Checkbox } from "flowbite-react";
import type {
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";

export interface MissaoCardProps {
   missao: MissaoComEtapas;
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
   onAddEtapa: (missao: MissaoComEtapas) => void;
   onEditMissao: (missao: MissaoComEtapas) => void;
   onDeleteMissao: (missao: MissaoComEtapas) => void;
}

export const MissaoCard = memo(function MissaoCard({
   missao,
   loading,
   selectedIds,
   onToggleEtapa,
   onToggleMissao,
   onDetailEtapa,
   onEditEtapa,
   onAddEtapa,
   onEditMissao,
   onDeleteMissao,
}: MissaoCardProps) {
   const etapaIds = useMemo(
      () => missao.etapas.map((e) => e.id),
      [missao.etapas]
   );

   const allChecked =
      etapaIds.length > 0 && etapaIds.every((id) => selectedIds.has(id));
   const someChecked =
      !allChecked && etapaIds.some((id) => selectedIds.has(id));
   const hasEtapas = missao.etapas.length > 0;

   return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
         {/* Header da missao */}
         <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
            {hasEtapas && (
               <Checkbox
                  color="red"
                  checked={allChecked}
                  ref={(el) => {
                     if (el) el.indeterminate = someChecked;
                  }}
                  onChange={() => onToggleMissao(etapaIds)}
                  className="cursor-pointer"
               />
            )}
            <span className="text-sm font-semibold text-gray-900">
               {missao.titulo ?? `Missao #${missao.id}`}
            </span>
            {missao.obs && (
               <span className="rounded bg-yellow-50 px-3 py-1 text-xs text-yellow-800">
                  {missao.obs}
               </span>
            )}
            <div className="ml-auto flex items-center gap-1">
               <button
                  onClick={() => onAddEtapa(missao)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-700"
                  title="Adicionar etapa"
               >
                  <HiPlus className="h-4 w-4" />
               </button>
               <button
                  onClick={() => onEditMissao(missao)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Editar missao"
               >
                  <HiPencilAlt className="h-4 w-4" />
               </button>
               {!hasEtapas && (
                  <button
                     onClick={() => onDeleteMissao(missao)}
                     className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                     title="Excluir missao"
                  >
                     <HiTrash className="h-4 w-4" />
                  </button>
               )}
            </div>
         </div>

         {/* Tabela de etapas ou mensagem vazia */}
         {hasEtapas ? (
            <EtapasInnerTable
               etapas={missao.etapas}
               loading={loading}
               selectedIds={selectedIds}
               onToggleEtapa={onToggleEtapa}
               onDetailEtapa={onDetailEtapa}
               onEditEtapa={onEditEtapa}
            />
         ) : (
            <div className="flex items-center justify-center px-4 py-8 text-sm text-gray-400">
               Nenhuma etapa cadastrada
            </div>
         )}
      </div>
   );
});
