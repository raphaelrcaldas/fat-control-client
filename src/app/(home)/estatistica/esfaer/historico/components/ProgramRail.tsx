"use client";

import { useMemo } from "react";
import { TextInput } from "flowbite-react";
import { TbSearch, TbX } from "react-icons/tb";
import { getGroupColor } from "../constants";
import { ProgramRow } from "./ProgramRow";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

interface ProgramRailProps {
   programas: HistPrograma[];
   /** Cores por programa, derivadas UMA vez na página (mesma fonte do gráfico). */
   programColors: Map<number, string>;
   /** Visibilidade por programa (`esfaer_id → visível`; ausente = oculto). */
   toggled: Record<number, boolean>;
   /** Quando preenchido, só Total + este programa ficam visíveis. */
   isolated: number | null;
   query: string;
   onQueryChange: (q: string) => void;
   onTogglePrograma: (id: number) => void;
   onIsolate: (id: number) => void;
}

/**
 * Rail lateral de programas: cabeçalho com contagem, busca (nome/descrição/
 * grupo), e lista rolável de `ProgramRow`.
 *
 * Não força largura fixa: a page controla o grid (rail empilha sob o chart no
 * mobile, ~330px no desktop).
 */
export function ProgramRail({
   programas,
   programColors,
   toggled,
   isolated,
   query,
   onQueryChange,
   onTogglePrograma,
   onIsolate,
}: ProgramRailProps) {
   const q = query.trim().toLowerCase();
   const filtered = useMemo(() => {
      if (!q) return programas;
      return programas.filter(
         (p) =>
            p.nome.toLowerCase().includes(q) ||
            p.descricao.toLowerCase().includes(q) ||
            p.grupo.toLowerCase().includes(q)
      );
   }, [programas, q]);

   return (
      <div className="flex flex-col rounded border border-slate-200 bg-white p-4 shadow-sm lg:h-full">
         <div className="flex shrink-0 items-baseline justify-between gap-2">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
               Programas ({programas.length})
            </h2>
            <span className="text-[10px] text-slate-400">
               clique no nome p/ isolar
            </span>
         </div>

         <div className="relative mt-3 shrink-0">
            <TextInput
               type="text"
               icon={TbSearch}
               placeholder="Buscar esforço..."
               value={query}
               onChange={(e) => onQueryChange(e.target.value)}
               sizing="sm"
            />
            {query && (
               <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  aria-label="Limpar busca"
                  className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
               >
                  <TbX className="h-4 w-4" />
               </button>
            )}
         </div>

         {/* Teto fixo + scroll interno: o grid da página é content-sized, então
             a lista não pode definir a altura da linha (rolaria a página toda
             com muitos programas). */}
         <div className="mt-3 max-h-120 space-y-2 overflow-auto pr-1 lg:min-h-0 lg:flex-1">
            {filtered.length === 0 ? (
               <p className="px-1 py-6 text-center text-sm text-slate-400">
                  Nenhum esforço encontrado para &quot;{query}&quot;
               </p>
            ) : (
               filtered.map((p) => {
                  const isolatedRow = isolated === p.esfaer_id;
                  const checked =
                     isolated != null
                        ? isolatedRow
                        : toggled[p.esfaer_id] === true;
                  const dimmed = isolated != null && !isolatedRow;
                  const color =
                     programColors.get(p.esfaer_id) ?? getGroupColor(p.grupo);
                  return (
                     <ProgramRow
                        key={p.esfaer_id}
                        programa={p}
                        color={color}
                        checked={checked}
                        isolated={isolatedRow}
                        dimmed={dimmed}
                        onToggle={() => onTogglePrograma(p.esfaer_id)}
                        onIsolate={() => onIsolate(p.esfaer_id)}
                     />
                  );
               })
            )}
         </div>
      </div>
   );
}
