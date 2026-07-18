"use client";

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
   SituacaoSimulacao,
} from "services/routes/cegep/missoes";
import { formatPeriodoSemAno } from "utils/dateHandler";
import { getPostoByShort } from "@/constants/militar/postos";

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

const SIT_LABEL: Record<SituacaoSimulacao, string> = {
   c: "Comissionado",
   d: "Diária",
   g: "Grat Rep",
};

function currency(v: number): string {
   return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function qtdLabel(qtd: number): string {
   return qtd.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
   });
}

/** Linha da nota: descrição à esquerda, valor à direita (colunas alinhadas). */
function ReceiptLine({
   desc,
   amount,
   bold,
}: {
   desc: string;
   amount: string;
   bold?: boolean;
}) {
   return (
      <div className="grid grid-cols-[1fr_auto] gap-x-3">
         <span className="truncate text-slate-500">{desc}</span>
         <span
            className={
               bold
                  ? "text-right font-semibold text-slate-900"
                  : "text-right text-slate-700"
            }
         >
            {amount}
         </span>
      </div>
   );
}

/**
 * Memória de cálculo de uma combinação dentro de um pernoite, em formato de
 * nota fiscal: rótulo (PG · situação) + uma linha por parcela (qtd × valor),
 * acréscimo quando houver e o subtotal por militar. Valores UNITÁRIOS
 * (1 militar) — o total por quantidade fica no resumo por combinação.
 */
function ComboBlock({
   combo,
   acDesloc,
}: {
   combo: SimulacaoPernoiteCombinacao;
   acDesloc: number;
}) {
   const isGrat = combo.sit === "g";
   const pg = getPostoByShort(combo.p_g)?.mid ?? combo.p_g.toUpperCase();

   return (
      <div className="space-y-0.5">
         <p className="font-semibold text-slate-800">
            {pg} · {SIT_LABEL[combo.sit]}
         </p>
         {combo.vals.map((v, i) => (
            <ReceiptLine
               key={i}
               desc={
                  isGrat
                     ? `${qtdLabel(v.qtd)} dias × ${currency(v.valor)} (2% soldo)`
                     : `${qtdLabel(v.qtd)} × ${currency(v.valor)}`
               }
               amount={currency(v.qtd * v.valor)}
            />
         ))}
         {/* Diária/comiss.: o subtotal do backend já embute o acréscimo do
             pernoite; sem esta linha a soma da nota não fecharia. */}
         {!isGrat && acDesloc > 0 && (
            <ReceiptLine desc="Acréscimo desloc." amount={currency(acDesloc)} />
         )}
         <div className="mt-0.5 border-t border-dashed border-slate-300 pt-0.5">
            <ReceiptLine
               desc="subtotal / militar"
               amount={currency(combo.subtotal)}
               bold
            />
         </div>
      </div>
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
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
         <span className="truncate">
            {localCidade}{" "}
            <span className="text-slate-400">(grupo {pernoite.grupo_cid})</span>{" "}
            · {formatPeriodoSemAno(pernoite.data_ini, pernoite.data_fim)} ·{" "}
            {pernoite.dias} {pernoite.dias === 1 ? "dia" : "dias"}
            {pernoite.ac_desloc > 0 && " · +R$95"}
         </span>
         <span className="font-semibold whitespace-nowrap text-slate-800 tabular-nums">
            {currency(subtotalPorMilitar)}{" "}
            <span className="text-[10px] font-normal text-slate-400">
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
                     <div className="space-y-3 font-mono text-xs tabular-nums">
                        {pernoite.combinacoes.map((combo, i) => (
                           <ComboBlock
                              key={`${combo.p_g}-${combo.sit}-${i}`}
                              combo={combo}
                              acDesloc={pernoite.ac_desloc}
                           />
                        ))}
                        {pernoite.ac_desloc === 0 && (
                           <p className="text-[10px] text-slate-400 italic">
                              sem acréscimo R$ 95 neste pernoite
                           </p>
                        )}
                     </div>
                  </AccordionContent>
               </AccordionPanel>
            );
         })}
      </Accordion>
   );
}
