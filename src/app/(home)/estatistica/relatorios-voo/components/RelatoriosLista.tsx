"use client";

import clsx from "clsx";
import { formatDiaSemana } from "utils/dateHandler";
import type { RelatorioVoo } from "services/routes/estatistica/relatoriosVoo";

interface Props {
   grupos: { data: string; itens: RelatorioVoo[] }[];
   selecionado: number | null;
   onSelecionar: (id: number) => void;
}

export function RelatoriosLista({ grupos, selecionado, onSelecionar }: Props) {
   return (
      <div className="min-h-0 overflow-y-auto rounded border border-slate-200 bg-white shadow-sm">
         {grupos.map((grupo) => (
            <section key={grupo.data} aria-label={formatDiaSemana(grupo.data)}>
               <div className="flex items-baseline justify-between border-y border-slate-200 bg-slate-50 px-3.5 py-1.5 first:border-t-0">
                  <span className="text-xs font-bold text-slate-800">
                     {formatDiaSemana(grupo.data)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                     {grupo.itens.length}{" "}
                     {grupo.itens.length > 1 ? "relatórios" : "relatório"}
                  </span>
               </div>
               {grupo.itens.map((r) => {
                  const ativo = r.id === selecionado;
                  const nomeArquivo = r.file_path.split("/").pop();
                  const quemEnviou =
                     `${r.uploaded_by_p_g} ${r.uploaded_by_nome_guerra}`.trim();
                  return (
                     <button
                        key={r.id}
                        type="button"
                        aria-current={ativo}
                        aria-label={`${r.anv}, ${nomeArquivo}, ${r.obs || "sem observação"}, enviado por ${quemEnviou}`}
                        onClick={() => onSelecionar(r.id)}
                        className={clsx(
                           "grid min-h-[48px] w-full grid-cols-[58px_minmax(0,1fr)_112px] items-center gap-2.5 border-b border-l-[3px] border-b-slate-100 py-1.5 pr-3.5 pl-[11px] text-left",
                           ativo
                              ? "border-l-primary-600 bg-primary-50"
                              : "border-l-transparent bg-white hover:bg-slate-50"
                        )}
                     >
                        <span
                           className={clsx(
                              "justify-self-start rounded px-1.5 py-0.5 font-mono text-xs font-bold",
                              ativo
                                 ? "bg-primary-600 text-white"
                                 : "bg-slate-100 text-slate-700"
                           )}
                        >
                           {r.anv}
                        </span>
                        <span className="flex min-w-0 flex-col">
                           <span
                              title={r.file_path}
                              className="truncate font-mono text-[11.5px] text-slate-700"
                           >
                              {nomeArquivo}
                           </span>
                           <span
                              title={r.obs ?? undefined}
                              className={clsx(
                                 "truncate text-[11.5px]",
                                 ativo ? "text-slate-600" : "text-slate-500"
                              )}
                           >
                              {r.obs || "Sem observação"}
                           </span>
                        </span>
                        <span
                           title={quemEnviou}
                           className={clsx(
                              "truncate text-right text-[11px] uppercase",
                              ativo ? "text-slate-600" : "text-slate-500"
                           )}
                        >
                           {quemEnviou}
                        </span>
                     </button>
                  );
               })}
            </section>
         ))}
      </div>
   );
}
