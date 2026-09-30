"use client";

import { memo, useMemo } from "react";
import { Checkbox } from "flowbite-react";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import { EtapasInnerTable } from "./EtapasInnerTable";

export interface MissaoCardProps {
   missao: MissaoComEtapas;
   selectedIds: Set<number>;
   onToggleEtapa: (id: number) => void;
   onToggleMissao: (etapaIds: number[]) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
}

export const MissaoCard = memo(function MissaoCard({
   missao,
   selectedIds,
   onToggleEtapa,
   onToggleMissao,
   onDetailEtapa,
   onEditEtapa,
}: MissaoCardProps) {
   const etapaIds = useMemo(
      () => missao.etapas.map((e) => e.id),
      [missao.etapas]
   );

   const allChecked =
      etapaIds.length > 0 && etapaIds.every((id) => selectedIds.has(id));
   const someChecked =
      !allChecked && etapaIds.some((id) => selectedIds.has(id));

   return (
      <div className="mx-0.5 overflow-hidden rounded border border-gray-300 bg-white shadow">
         {/* Header da missao */}
         <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white py-1.5 pr-1.5">
            {/* Coluna w-7 espelhando a 1ª célula (w-7) das linhas de etapa, para
                o checkbox da missão cair exatamente sobre os das etapas. */}
            <div className="flex w-7 shrink-0 items-center justify-center">
               {/* Glifo compacto e discreto (17.5px), sem alvo de 44px —
                   densidade priorizada sobre a ergonomia de toque nesta lista.
                   Sempre montado: `list_etapas` parte de `Etapa` com join em
                   `Missao`, então uma missão sem etapa nunca chega até aqui
                   (invariante em docs/ai/notes/dominio.md). */}
               <Checkbox
                  color="primary"
                  checked={allChecked}
                  ref={(el) => {
                     if (el) el.indeterminate = someChecked;
                  }}
                  onChange={() => onToggleMissao(etapaIds)}
                  aria-label={`Selecionar todas as etapas de ${missao.titulo ?? `Missão #${missao.id}`}`}
                  className="size-5 cursor-pointer"
               />
            </div>
            <span className="text-sm font-medium text-slate-800">
               {missao.titulo ?? `Missão #${missao.id}`}
            </span>
            {missao.obs && (
               <span className="rounded-full border border-yellow-300 bg-yellow-100/80 px-4 py-0.5 text-xs font-semibold text-yellow-800">
                  {missao.obs}
               </span>
            )}
         </div>

         <EtapasInnerTable
            etapas={missao.etapas}
            selectedIds={selectedIds}
            onToggleEtapa={onToggleEtapa}
            onDetailEtapa={onDetailEtapa}
            onEditEtapa={onEditEtapa}
         />
      </div>
   );
});
