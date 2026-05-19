"use client";

import type { ComponentType } from "react";

import type { TipoMissaoPublic } from "services/routes/estatistica/tiposMissao";

import type { DraftOIItem } from "../../_state/types";

import { ESPECIFICOS_REGISTRY } from "./registry";
import type { EspecificoBlockProps } from "./types";

interface EspecificosListProps {
   oiItems: DraftOIItem[];
   tiposMissao: TipoMissaoPublic[];
}

interface ResolvedBlock {
   key: string;
   tipoMissaoCod: string;
   oiCount: number;
   Component: ComponentType<EspecificoBlockProps>;
}

export function EspecificosList({
   oiItems,
   tiposMissao,
}: EspecificosListProps) {
   const codById = new Map<number, string>();
   for (const t of tiposMissao) codById.set(t.id, t.cod);

   const counts = new Map<string, number>();
   for (const oi of oiItems) {
      if (oi.tipo_missao_id == null) continue;
      const cod = codById.get(oi.tipo_missao_id);
      if (!cod) continue;
      counts.set(cod, (counts.get(cod) ?? 0) + 1);
   }

   const blocks: ResolvedBlock[] = [];
   const seenComponents = new Map<
      ComponentType<EspecificoBlockProps>,
      ResolvedBlock
   >();

   for (const [cod, count] of counts) {
      const Component = ESPECIFICOS_REGISTRY[cod];
      if (!Component) continue;

      const existing = seenComponents.get(Component);
      if (existing) {
         existing.oiCount += count;
         existing.key += `-${cod}`;
         continue;
      }

      const block: ResolvedBlock = {
         key: cod,
         tipoMissaoCod: cod,
         oiCount: count,
         Component,
      };
      blocks.push(block);
      seenComponents.set(Component, block);
   }

   if (blocks.length === 0) {
      return (
         <p className="text-sm text-gray-500 italic">
            Nenhum específico detectado.
         </p>
      );
   }

   return (
      <div className="flex flex-col gap-3">
         {blocks.map(({ key, tipoMissaoCod, oiCount, Component }) => (
            <Component
               key={key}
               tipoMissaoCod={tipoMissaoCod}
               oiCount={oiCount}
            />
         ))}
      </div>
   );
}
