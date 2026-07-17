"use client";

import { memo, useMemo } from "react";
import { HiTrash } from "react-icons/hi";
import { Checkbox } from "flowbite-react";
import type {
   EtapaItem,
   MissaoComEtapas,
} from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

export interface MissaoCardProps {
   missao: MissaoComEtapas;
   loading: boolean;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
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
      <div className="mx-0.5 overflow-hidden rounded border border-gray-300 bg-white shadow">
         {/* Header da missao */}
         <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white p-1.5">
            {hasEtapas && (
               <Checkbox
                  color="primary"
                  checked={allChecked}
                  ref={(el) => {
                     if (el) el.indeterminate = someChecked;
                  }}
                  onChange={() => onToggleMissao(etapaIds)}
                  aria-label={`Selecionar todas as etapas de ${missao.titulo ?? `Missão #${missao.id}`}`}
                  className="size-[24px] cursor-pointer pointer-coarse:size-[44px]"
               />
            )}
            <span className="text-sm font-medium text-slate-800">
               {missao.titulo ?? `Missão #${missao.id}`}
            </span>
            {missao.obs && (
               <span className="rounded-full border border-yellow-300 bg-yellow-100/80 px-4 py-0.5 text-xs font-semibold text-yellow-800">
                  {missao.obs}
               </span>
            )}
            {!hasEtapas && (
               <PermBased requiredPerm="create" resource="etp_mis">
                  <div className="ml-auto flex items-center gap-0.5">
                     <button
                        onClick={() => onDeleteMissao(missao)}
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50/80 hover:text-red-600 hover:shadow-sm"
                        title="Excluir missao"
                     >
                        <HiTrash className="h-4 w-4" />
                     </button>
                  </div>
               </PermBased>
            )}
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
