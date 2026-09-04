"use client";

import clsx from "clsx";
import type { ExportColumn } from "./exportTypes";

interface ColumnsPreviewTableProps<T> {
   rows: T[];
   columns: ExportColumn<T>[];
}

/**
 * Primeiras linhas da planilha, como ela vai sair.
 *
 * O zebrado espelha o do .xlsx (linhas pares sombreadas) de proposito: a
 * previa so vale se mostrar o arquivo, e nao uma tabela parecida com ele. O
 * travessao aqui e diferente: na planilha a celula sai VAZIA, e o "—" existe
 * so para a ausencia de dado ficar visivel na tela.
 */
export function ColumnsPreviewTable<T>({
   rows,
   columns,
}: ColumnsPreviewTableProps<T>) {
   return (
      // Tabela larga rola no proprio container: o body da pagina nunca deve
      // rolar na horizontal.
      <div className="overflow-x-auto rounded border border-slate-200">
         <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-900">
               <tr>
                  {columns.map((c) => (
                     <th
                        key={c.key}
                        className="px-2 py-1.5 font-semibold whitespace-nowrap"
                     >
                        {c.label}
                     </th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {rows.map((row, i) => (
                  <tr key={i} className={clsx(i % 2 === 1 && "bg-slate-50")}>
                     {columns.map((c) => {
                        const raw = c.get(row);
                        const empty =
                           raw === null || raw === undefined || raw === "";
                        return (
                           <td
                              key={c.key}
                              className={clsx(
                                 "px-2 py-1 whitespace-nowrap",
                                 empty ? "text-slate-300" : "text-slate-700",
                                 c.uppercase && "uppercase"
                              )}
                           >
                              {empty ? "—" : String(raw)}
                           </td>
                        );
                     })}
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
