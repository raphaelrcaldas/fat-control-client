"use client";

import { useMemo } from "react";
import { Checkbox, Label } from "flowbite-react";
import type { ExportColumn } from "./exportTypes";

const SEM_GRUPO = "Outras colunas";

interface ColumnPickerProps<T> {
   /** Só as opcionais: as fixas não têm o que escolher. */
   columns: ExportColumn<T>[];
   checked: Set<string>;
   onToggle: (key: string) => void;
   onSetMany: (keys: string[], value: boolean) => void;
}

/**
 * Seletor de colunas opcionais, agrupado por secao.
 *
 * O agrupamento e o mesmo do formulario de cadastro ("Dados Militares" /
 * "Dados Pessoais"): quem preenche o cadastro ja sabe onde cada campo mora, e
 * uma lista corrida de treze checkboxes obriga a reler todos para achar um.
 * Tela de dominio soma o proprio bloco (Passaporte, CRM, Cartao de Saude).
 *
 * O titulo da secao e o "marcar todas" global moram no `ExportSection` do
 * modal — aqui ficam so os grupos.
 */
export function ColumnPicker<T>({
   columns,
   checked,
   onToggle,
   onSetMany,
}: ColumnPickerProps<T>) {
   // Ordem dos grupos = ordem de aparicao no catalogo, e nao alfabetica: o
   // catalogo ja esta na ordem em que as colunas saem na planilha.
   const grupos = useMemo(() => {
      const mapa = new Map<string, ExportColumn<T>[]>();
      for (const column of columns) {
         const nome = column.group ?? SEM_GRUPO;
         const atual = mapa.get(nome);
         if (atual) atual.push(column);
         else mapa.set(nome, [column]);
      }
      return [...mapa.entries()];
   }, [columns]);

   return (
      <div className="space-y-2">
         {grupos.map(([nome, doGrupo]) => {
            const keys = doGrupo.map((c) => c.key);
            const marcadas = keys.filter((k) => checked.has(k)).length;
            const todas = marcadas === keys.length;
            return (
               <fieldset
                  key={nome}
                  className="rounded border border-slate-200 px-3 pt-1 pb-2.5"
               >
                  <legend className="flex items-center gap-2 px-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                     {nome}
                     {/* `aria-hidden`: a <legend> e o NOME ACESSIVEL do grupo,
                         repetido pelo leitor de tela em cada checkbox dentro
                         dele. Sem isto o nome mudaria a cada clique ("Dados
                         Militares 3 barra 5") — e a contagem e redundante para
                         quem ja ouve o estado de cada caixa. */}
                     <span
                        aria-hidden
                        className="rounded bg-slate-100 px-1 py-px text-[10px] font-semibold text-slate-600 normal-case tabular-nums"
                     >
                        {marcadas}/{keys.length}
                     </span>
                     <button
                        type="button"
                        onClick={() => onSetMany(keys, !todas)}
                        className="text-primary-600 hover:text-primary-700 rounded text-[10px] font-semibold normal-case hover:underline"
                     >
                        {todas ? "desmarcar todas" : "marcar todas"}
                     </button>
                  </legend>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                     {doGrupo.map((column) => (
                        <div
                           key={column.key}
                           className="flex items-center gap-2"
                        >
                           <Checkbox
                              id={`col-${column.key}`}
                              className="size-[20px] pointer-coarse:size-[44px]"
                              color="primary"
                              checked={checked.has(column.key)}
                              onChange={() => onToggle(column.key)}
                           />
                           <Label
                              htmlFor={`col-${column.key}`}
                              className="cursor-pointer text-sm text-slate-700 transition-colors hover:text-slate-900"
                           >
                              {column.label}
                           </Label>
                        </div>
                     ))}
                  </div>
               </fieldset>
            );
         })}
      </div>
   );
}
