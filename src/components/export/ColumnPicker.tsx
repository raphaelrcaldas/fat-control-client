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

   const todasKeys = columns.map((c) => c.key);
   const todasMarcadas =
      todasKeys.length > 0 && todasKeys.every((k) => checked.has(k));

   return (
      <div className="space-y-3">
         <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-semibold">Colunas adicionais</Label>
            <button
               type="button"
               onClick={() => onSetMany(todasKeys, !todasMarcadas)}
               className="text-primary-600 hover:text-primary-700 rounded px-1 text-xs font-semibold hover:underline"
            >
               {todasMarcadas ? "Desmarcar todas" : "Marcar todas"}
            </button>
         </div>

         {grupos.map(([nome, doGrupo]) => {
            const keys = doGrupo.map((c) => c.key);
            const marcadas = keys.every((k) => checked.has(k));
            return (
               <fieldset
                  key={nome}
                  className="rounded border border-slate-200 px-3 py-2"
               >
                  <legend className="flex items-center gap-2 px-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
                     {nome}
                     <button
                        type="button"
                        onClick={() => onSetMany(keys, !marcadas)}
                        className="text-primary-600 hover:text-primary-700 rounded text-[10px] font-semibold normal-case hover:underline"
                     >
                        {marcadas ? "desmarcar todas" : "marcar todas"}
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
                              className="text-sm text-slate-700"
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
