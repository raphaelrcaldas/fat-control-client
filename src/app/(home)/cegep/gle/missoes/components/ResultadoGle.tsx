"use client";

import { useState } from "react";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi";

import { isoDateToString } from "@/../utils/dateHandler";
import { formatarValorEmReais } from "@/../utils/valorPorExtenso";
import type { TrechoCalculado } from "services/routes/cegep/gleCalculo";
import type { MissaoGle } from "services/routes/cegep/gleMissoes";

import { GrupoBadge } from "../../localidades/components/GrupoBadge";

/** "2026-04-26T14:15:00" -> "26/04/26 14:15", sem tocar em fuso. */
function dataHora(iso: string): string {
   const [data, hora = ""] = iso.split("T");
   const [a, m, d] = data.split("-");
   return `${d}/${m}/${a.slice(-2)} ${hora.slice(0, 5)}`;
}

export function ResultadoGle({ calculo }: { calculo: MissaoGle }) {
   return (
      <div className="space-y-2">
         <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm">
            <div>
               <span className="block text-xs text-slate-500">
                  Multiplicador total
               </span>
               <span className="font-mono text-lg font-bold text-slate-900">
                  {calculo.multiplicador}
               </span>
            </div>
            <div className="text-right">
               <span className="block text-xs text-slate-500">
                  Percentual do soldo
               </span>
               <span className="text-lg font-bold text-slate-900">
                  {calculo.percentual}
               </span>
            </div>
         </div>

         {calculo.trechos.map((trecho) => (
            <TrechoResultado key={trecho.loc_esp_id} trecho={trecho} />
         ))}

         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
               <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                     <th className="px-3 py-2 text-left font-medium">
                        Militar
                     </th>
                     <th className="px-3 py-2 text-right font-medium">Soldo</th>
                     <th className="px-3 py-2 text-right font-medium">
                        Valor devido
                     </th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {calculo.militares.map((m) => (
                     <tr key={m.user_id}>
                        <td className="px-3 py-2 uppercase">
                           <span className="font-mono text-xs font-semibold text-slate-500">
                              {m.p_g}
                           </span>{" "}
                           <span className="text-slate-800">
                              {m.nome_guerra}
                           </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-slate-500">
                           {formatarValorEmReais(m.soldo)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                           {formatarValorEmReais(m.valor)}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

/**
 * Um trecho com a memória de cálculo recolhida.
 *
 * A memória existe porque o valor precisa ser **conferível**: sem ela o
 * usuário teria de confiar num número só. Dia zerado pela antisobreposição
 * aparece riscado, não some — ver que ele foi considerado e por que não
 * contou é parte da conferência.
 */
function TrechoResultado({ trecho }: { trecho: TrechoCalculado }) {
   const [aberto, setAberto] = useState(false);

   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 items-center gap-2">
               <GrupoBadge grupo={trecho.grupo} />
               <span className="truncate font-medium text-slate-800">
                  {trecho.cidade}
               </span>
               <span className="font-mono text-xs text-slate-500">
                  {trecho.uf}
               </span>
            </div>

            <span className="font-mono text-xs whitespace-nowrap text-slate-500">
               {dataHora(trecho.chegada)} → {dataHora(trecho.afastamento)}
            </span>

            <button
               type="button"
               onClick={() => setAberto((v) => !v)}
               aria-expanded={aberto}
               className="inline-flex min-h-[24px] items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
               {trecho.dias_contados}{" "}
               {trecho.dias_contados === 1 ? "dia" : "dias"}
               <HiChevronDown
                  className={clsx(
                     "h-4 w-4 transition-transform",
                     aberto && "rotate-180"
                  )}
               />
            </button>
         </div>

         {aberto && (
            <ul className="divide-y divide-slate-100 border-t border-slate-200 bg-slate-50/60">
               {trecho.dias.map((dia) => (
                  <li
                     key={dia.data}
                     className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs"
                  >
                     <span
                        className={clsx(
                           "font-mono",
                           dia.duplicado
                              ? "text-slate-400 line-through"
                              : "text-slate-600"
                        )}
                     >
                        {isoDateToString(dia.data)}
                     </span>
                     <span className="text-slate-400">
                        {Number(dia.horas).toFixed(1)}h
                     </span>
                     <span
                        className={clsx(
                           "font-mono",
                           dia.duplicado ? "text-slate-400" : "text-slate-700"
                        )}
                     >
                        {dia.duplicado ? "já pago em outro trecho" : dia.fator}
                     </span>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}
