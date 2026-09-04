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
 *
 * Coluna `hydrated` ainda nao tem valor nesta altura — ele so chega no clique
 * de exportar. Mostra o `sample`, um exemplo obviamente ficticio (CPF zerado,
 * "fulano@..."), e nao uma mascara generica: `••••` se le como "o sistema nao
 * tem esse dado", quando na verdade tem. Italico e o rodape deixam claro que
 * ali e exemplo.
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
                                 c.hydrated
                                    ? "text-slate-400 italic"
                                    : empty
                                      ? "text-slate-300"
                                      : "text-slate-700",
                                 !c.hydrated && c.uppercase && "uppercase"
                              )}
                           >
                              {c.hydrated
                                 ? (c.sample ?? "exemplo")
                                 : empty
                                   ? "—"
                                   : String(raw)}
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

/** Rodape da previa, so quando ha coluna com exemplo ficticio em cena. */
export function PreviewSampleNote({ visible }: { visible: boolean }) {
   if (!visible) return null;
   return (
      <p className="mt-1 text-xs text-slate-500">
         Em <span className="text-slate-400 italic">itálico</span>, exemplo
         fictício: o valor real de cada militar é buscado na exportação.
      </p>
   );
}
