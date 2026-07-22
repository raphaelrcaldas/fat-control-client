"use client";

import clsx from "clsx";
import {
   Accordion,
   AccordionContent,
   AccordionPanel,
   AccordionTitle,
} from "flowbite-react";
import {
   Pernoite,
   SimulacaoPernoiteCombinacao,
   SimulacaoPernoiteResultado,
} from "services/routes/cegep/missoes";
import { formatPeriodoSemAno } from "utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import { getPostoByShort } from "@/constants/militar/postos";
import { GRAT_REP_DESC, SITUACAO_CONFIG } from "@/constants/cegep/situacoes";

// Tema sóbrio do projeto (rounded, não rounded-lg; border-slate-200) — o
// default do Flowbite traz rounded-lg/border-gray-200/hover:bg-gray-100.
// Cada subcomponente (Accordion/AccordionContent/AccordionTitle) recebe a
// própria fatia via prop `theme` — o tipo de `theme` do <Accordion> raiz
// só cobre root (base/flush), não a árvore inteira.
const rootTheme = {
   base: "divide-y divide-slate-200 rounded border border-slate-200",
   flush: { off: "", on: "" },
};

const contentTheme = {
   base: "border-t border-slate-100 bg-slate-50 p-3",
};

const titleTheme = {
   arrow: {
      base: "h-4 w-4 shrink-0 text-slate-400",
      open: { off: "", on: "rotate-180" },
   },
   base: "flex w-full items-center justify-between gap-3 p-3 text-left font-medium text-slate-700",
   flush: { off: "hover:bg-slate-50 focus:outline-none", on: "" },
   heading: "min-w-0 flex-1",
   open: { off: "", on: "bg-slate-50" },
};

function qtdLabel(qtd: number): string {
   return qtd.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
   });
}

/**
 * Memória de cálculo de uma combinação como linhas de tabela (colunas
 * compartilhadas entre todas as parcelas do pernoite): cabeçalho
 * (PG · situação) + uma linha por parcela (qtd × valor), acréscimo quando
 * houver e o subtotal por militar. Valores UNITÁRIOS (1 militar) — o total
 * por quantidade fica no resumo por combinação.
 */
function ComboRows({
   combo,
   acDesloc,
   first,
}: {
   combo: SimulacaoPernoiteCombinacao;
   acDesloc: number;
   first: boolean;
}) {
   const isGrat = combo.sit === "g";
   const pg = getPostoByShort(combo.p_g)?.mid ?? combo.p_g.toUpperCase();

   return (
      <>
         <tr>
            <td
               colSpan={2}
               className={clsx(
                  "font-semibold text-slate-800",
                  first ? "pt-2" : "pt-3"
               )}
            >
               {pg} · {SITUACAO_CONFIG[combo.sit].label}
            </td>
         </tr>
         {combo.vals.map((v, i) => (
            <tr key={i}>
               <td className="text-slate-500">
                  {isGrat
                     ? `${qtdLabel(v.qtd)} dias × ${realCurrency(v.valor)} (${GRAT_REP_DESC})`
                     : `${qtdLabel(v.qtd)} × ${realCurrency(v.valor)}`}
               </td>
               <td className="pl-4 text-right whitespace-nowrap text-slate-700">
                  {realCurrency(v.qtd * v.valor)}
               </td>
            </tr>
         ))}
         {/* Diária/comiss.: o subtotal do backend já embute o acréscimo do
             pernoite; sem esta linha a soma da nota não fecharia. */}
         {!isGrat && acDesloc > 0 && (
            <tr>
               <td className="text-slate-500">Acréscimo desloc.</td>
               <td className="pl-4 text-right whitespace-nowrap text-slate-700">
                  {realCurrency(acDesloc)}
               </td>
            </tr>
         )}
         <tr>
            <td className="border-t border-dashed border-slate-300 pt-0.5 text-slate-500">
               subtotal / militar
            </td>
            <td className="border-t border-dashed border-slate-300 pt-0.5 pl-4 text-right font-semibold whitespace-nowrap text-slate-900">
               {realCurrency(combo.subtotal)}
            </td>
         </tr>
      </>
   );
}

function PernoiteHeader({
   pernoite,
   pnt,
}: {
   pernoite: SimulacaoPernoiteResultado;
   pnt?: Pernoite;
}) {
   // Soma dos subtotais por combinação SEM multiplicar pela quantidade de
   // militares — memória de cálculo unitária (custo "por militar"), não o
   // custo total do pernoite (esse já está no resumo por combinação).
   const subtotalPorMilitar = pernoite.combinacoes.reduce(
      (sum, c) => sum + c.subtotal,
      0
   );

   const localCidade = pnt?.cidade
      ? `${pnt.cidade.nome}, ${pnt.cidade.uf}`
      : "Cidade";

   return (
      <div className="flex flex-wrap items-start justify-between gap-2 font-mono text-xs">
         <span className="min-w-0 flex-1">
            <span className="block truncate">
               {localCidade}{" "}
               <span className="text-slate-500">G{pernoite.grupo_cid}</span>
            </span>
            <span className="block text-slate-500">
               {formatPeriodoSemAno(pernoite.data_ini, pernoite.data_fim)} ·{" "}
               {pernoite.dias} {pernoite.dias === 1 ? "dia" : "dias"}
               {pernoite.ac_desloc > 0 &&
                  ` · +${realCurrency(pernoite.ac_desloc)}`}
            </span>
         </span>
         <span className="font-semibold whitespace-nowrap text-slate-800 tabular-nums">
            {realCurrency(subtotalPorMilitar)}{" "}
            <span className="text-[10px] font-normal text-slate-500">
               / militar
            </span>
         </span>
      </div>
   );
}

interface ExtratoAccordionProps {
   pernoites: SimulacaoPernoiteResultado[];
   pnts: Pernoite[];
}

export function ExtratoAccordion({ pernoites, pnts }: ExtratoAccordionProps) {
   if (pernoites.length === 0) return null;

   return (
      <Accordion theme={rootTheme}>
         {pernoites.map((pernoite) => {
            const pnt = pnts[pernoite.indice];
            return (
               <AccordionPanel key={pernoite.indice}>
                  <AccordionTitle as="h3" theme={titleTheme}>
                     <PernoiteHeader pernoite={pernoite} pnt={pnt} />
                  </AccordionTitle>
                  <AccordionContent theme={contentTheme}>
                     <table className="w-full border-collapse font-mono text-xs tabular-nums">
                        <thead>
                           <tr className="border-b border-slate-300 text-[10px] tracking-wide text-slate-500 uppercase">
                              <th className="pb-1 text-left font-normal">
                                 Cálculo
                              </th>
                              <th className="pb-1 pl-4 text-right font-normal">
                                 Valor / militar
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {pernoite.combinacoes.map((combo, i) => (
                              <ComboRows
                                 key={`${combo.p_g}-${combo.sit}-${i}`}
                                 combo={combo}
                                 acDesloc={pernoite.ac_desloc}
                                 first={i === 0}
                              />
                           ))}
                        </tbody>
                     </table>
                     {pernoite.ac_desloc === 0 && (
                        <p className="mt-3 text-[10px] text-slate-500 italic">
                           sem acréscimo de deslocamento neste pernoite
                        </p>
                     )}
                  </AccordionContent>
               </AccordionPanel>
            );
         })}
      </Accordion>
   );
}
