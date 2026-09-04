"use client";

import clsx from "clsx";
import type { ExportColumn } from "./exportTypes";

/** Militares ficticios exibidos na previa. */
const PREVIEW_ROWS = 3;

interface ColumnsPreviewTableProps<T> {
   columns: ExportColumn<T>[];
}

/**
 * Previa da planilha, com militares FICTICIOS.
 *
 * Ela responde "quais colunas saem e em que ordem?", e nao "o que tem no meu
 * carrinho" — para isso serve a gaveta. Um Fulano da Silva responde essa
 * pergunta tao bem quanto o efetivo real e resolve dois problemas de uma vez:
 * nao expoe dado de ninguem numa tela que vai ser printada, e dispensa
 * explicar por que uma coluna aparece preenchida e outra nao (as de PII so
 * sao buscadas no ato da exportacao).
 *
 * O zebrado espelha o do .xlsx (linhas pares sombreadas): a previa so vale se
 * mostrar o formato do arquivo, e nao uma tabela parecida com ele.
 */
export function ColumnsPreviewTable<T>({
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
               {Array.from({ length: PREVIEW_ROWS }, (_, i) => (
                  <tr key={i} className={clsx(i % 2 === 1 && "bg-slate-50")}>
                     {columns.map((c) => {
                        const valor = c.samples?.[i];
                        return (
                           <td
                              key={c.key}
                              className={clsx(
                                 "px-2 py-1 whitespace-nowrap",
                                 valor ? "text-slate-700" : "text-slate-300"
                              )}
                           >
                              {valor ?? "—"}
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
