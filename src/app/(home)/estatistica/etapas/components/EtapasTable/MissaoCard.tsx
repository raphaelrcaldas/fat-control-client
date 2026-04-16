"use client";

import { memo, useMemo } from "react";
import { HiPencilAlt, HiPlus, HiTrash } from "react-icons/hi";
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
      <div className="overflow-hidden rounded-xl border border-white/60 bg-white/50 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
         {/* Header da missao */}
         <div className="flex flex-wrap items-center gap-4 border-b border-white/50 bg-gradient-to-r from-white/70 to-white/30 px-5 py-3">
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
            <span className="text-base font-bold tracking-tight text-slate-800">
               {missao.titulo ?? `Missão #${missao.id}`}
            </span>
            {missao.obs && (
               <span className="rounded-full border border-yellow-200/50 bg-yellow-100/80 px-4 py-1 text-xs font-semibold text-yellow-800 shadow-sm backdrop-blur-sm">
                  {missao.obs}
               </span>
            )}
            <PermBased requiredPerm="create" resource="etp_mis">
               <div className="ml-auto flex items-center gap-1">
                  <button
                     onClick={() => onAddEtapa(missao)}
                     className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/60 hover:text-emerald-600 hover:shadow-sm"
                     title="Adicionar etapa"
                  >
                     <HiPlus className="h-4 w-4" />
                  </button>
                  <button
                     onClick={() => onEditMissao(missao)}
                     className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm"
                     title="Editar missao"
                  >
                     <HiPencilAlt className="h-4 w-4" />
                  </button>
                  {!hasEtapas && (
                     <button
                        onClick={() => onDeleteMissao(missao)}
                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50/80 hover:text-red-600 hover:shadow-sm"
                        title="Excluir missao"
                     >
                        <HiTrash className="h-4 w-4" />
                     </button>
                  )}
               </div>
            </PermBased>
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
