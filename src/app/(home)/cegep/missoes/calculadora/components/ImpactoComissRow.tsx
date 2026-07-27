"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import {
   HiCheckCircle,
   HiChevronDown,
   HiExclamation,
   HiX,
} from "react-icons/hi";
import type { ComissList } from "services/routes/cegep/comiss";
import { realCurrency, VALOR_DIARIA } from "utils/financeiro";
import type { ImpactoComiss } from "../hooks/useImpactoComissoes";
import { CompletudeSimBar } from "./CompletudeSimBar";

interface ImpactoComissRowProps {
   comiss: ComissList;
   /** Projeção pronta, ou `null` enquanto falta pernoite/resposta. */
   impacto: ImpactoComiss | null;
   onRemover: () => void;
}

/**
 * Uma linha da lista de impacto: quem, de quanto para quanto, e o ganho.
 *
 * A linha existe desde o instante em que o militar é acoplado — antes de
 * haver projeção ela mostra a completude de hoje e diz o que falta para
 * projetar. Assim acoplar nunca parece que não fez nada.
 */
export function ImpactoComissRow({
   comiss,
   impacto,
   onRemover,
}: ImpactoComissRowProps) {
   const [aberto, setAberto] = useState(false);
   const detalheId = useId();

   const user = comiss.user;
   const nome = `${user?.posto?.short ?? user?.p_g} ${user?.nome_guerra}`;
   const isPeriodo = !!comiss.dias_cumprir;

   // Vírgula decimal: "9,7%" — `toFixed`/interpolação crua sairiam "9.7%".
   const atual = (impacto?.atualBruta ?? comiss.completude).toLocaleString(
      "pt-BR"
   );
   const projetada = (
      impacto?.projetadaBruta ?? comiss.completude
   ).toLocaleString("pt-BR");

   return (
      <div className="py-3 first:pt-0 last:pb-0">
         <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
               <p className="truncate text-sm font-semibold text-slate-800 uppercase">
                  {nome}
               </p>
               <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                  {isPeriodo ? "período" : "comparativo"}
               </p>
            </div>
            <button
               type="button"
               onClick={onRemover}
               aria-label={`Tirar ${nome} da simulação`}
               className="-mt-1 -mr-1 flex min-h-[24px] min-w-[24px] shrink-0 items-center justify-center rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
            >
               <HiX className="size-4" aria-hidden />
            </button>
         </div>

         <div className="mt-2 flex items-center gap-2">
            <span className="w-11 shrink-0 text-right font-mono text-[11px] text-slate-500 tabular-nums">
               {atual}%
            </span>
            <div className="min-w-0 flex-1">
               <CompletudeSimBar
                  atual={impacto?.atual ?? comiss.completude}
                  projetada={impacto?.projetada ?? comiss.completude}
                  modulo={comiss.modulo}
                  ariaLabel={
                     impacto
                        ? `Completude de ${atual}% subiria para ${projetada}% com esta missão`
                        : `Completude atual de ${atual}%`
                  }
               />
            </div>
            <span
               className={clsx(
                  "w-11 shrink-0 font-mono text-[11px] font-bold tabular-nums",
                  impacto ? "text-amber-700" : "text-slate-400"
               )}
            >
               {impacto ? `${projetada}%` : "—"}
            </span>
         </div>

         <div className="mt-2 flex items-center justify-between gap-2">
            {impacto ? (
               <span className="font-mono text-[11px] font-semibold text-amber-700 tabular-nums">
                  +{impacto.ganho.toLocaleString("pt-BR")} p.p.
                  <span className="text-slate-400"> · </span>
                  {impacto.isPeriodo
                     ? `${impacto.deltaDias} ${impacto.deltaDias === 1 ? "dia" : "dias"}`
                     : realCurrency(impacto.deltaValor)}
               </span>
            ) : (
               <span className="text-[11px] text-slate-500">
                  Preencha um pernoite para projetar
               </span>
            )}

            {impacto && (
               <button
                  type="button"
                  onClick={() => setAberto((v) => !v)}
                  aria-expanded={aberto}
                  aria-controls={detalheId}
                  // Medidas em px, não em `rem`: a raiz do client é 87,5%
                  // (1rem = 14px), então `min-h-6` renderizaria 21px e não
                  // cumpriria os 24px do WCAG 2.5.8 no mouse.
                  className="flex min-h-[24px] items-center gap-1 rounded px-1.5 py-1 font-mono text-[10px] tracking-wider text-slate-500 uppercase transition-colors hover:bg-slate-100 hover:text-slate-700 pointer-coarse:min-h-[44px]"
               >
                  detalhes
                  <HiChevronDown
                     aria-hidden
                     className={clsx(
                        "size-3.5 transition-transform",
                        aberto && "rotate-180"
                     )}
                  />
               </button>
            )}
         </div>

         {impacto && aberto && (
            <div id={detalheId} className="mt-3">
               <Metricas impacto={impacto} />
               <Avisos impacto={impacto} />
            </div>
         )}
      </div>
   );
}

function Metricas({ impacto }: { impacto: ImpactoComiss }) {
   const { comiss, isPeriodo, deltaDias, deltaValor } = impacto;

   // No comparativo a contagem é em dinheiro; converter pela menor diária dá
   // escala em dias sem fingir precisão — daí o "~" antes dos números.
   const previsto = isPeriodo
      ? comiss.dias_cumprir!
      : Math.round((comiss.valor_aj_ab + comiss.valor_aj_fc) / VALOR_DIARIA);
   const computado = isPeriodo
      ? comiss.dias_comp
      : Math.round(comiss.vals_comp / VALOR_DIARIA);
   const acrescimo = isPeriodo
      ? deltaDias
      : Math.round(deltaValor / VALOR_DIARIA);
   const restante = previsto - computado - acrescimo;

   return (
      <div className="grid grid-cols-3 rounded border border-slate-200 bg-slate-50/60 py-2">
         <Metrica label="Computado" valor={computado} aprox={!isPeriodo} />
         <Metrica
            label="Simulado"
            valor={acrescimo}
            aprox={!isPeriodo}
            prefixo="+"
            cor="text-amber-700"
            divisores
         />
         <Metrica
            label="Restante"
            valor={restante}
            aprox={!isPeriodo}
            cor={restante < 0 ? "text-red-700" : undefined}
         />
      </div>
   );
}

function Metrica({
   label,
   valor,
   aprox,
   prefixo,
   cor,
   divisores,
}: {
   label: string;
   valor: number;
   aprox?: boolean;
   prefixo?: string;
   cor?: string;
   divisores?: boolean;
}) {
   return (
      <div
         className={clsx(
            "flex flex-col items-center gap-0.5 px-1",
            divisores && "border-x border-slate-200"
         )}
      >
         <span className="font-mono text-[9px] tracking-[0.16em] text-slate-500 uppercase">
            {label}
         </span>
         <span
            className={clsx(
               "font-mono text-base leading-none font-semibold tabular-nums",
               cor ?? "text-slate-900"
            )}
         >
            {/* Til antes do sinal: "~+5" lê "aproximadamente mais 5"; o
                inverso ("+~5") sai truncado na leitura. */}
            {aprox && <span className="text-slate-400">~</span>}
            {prefixo}
            {valor}
            <span className="ml-0.5 text-[10px] font-normal text-slate-500">
               d
            </span>
         </span>
      </div>
   );
}

function Avisos({ impacto }: { impacto: ImpactoComiss }) {
   const { projetadaBruta, atualBruta, fechaModulo } = impacto;
   const excedente = (
      Math.round((projetadaBruta - Math.max(100, atualBruta)) * 10) / 10
   ).toLocaleString("pt-BR");

   if (projetadaBruta <= 100 && !fechaModulo) return null;

   return (
      <div className="mt-2 space-y-1.5">
         {projetadaBruta > 100 && (
            <p className="flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
               <HiExclamation
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
               />
               <span>
                  A projeção passa de 100%: esta missão excede o que falta
                  cumprir em {excedente} p.p.
               </span>
            </p>
         )}
         {fechaModulo && (
            <p className="flex items-start gap-1.5 rounded border border-green-200 bg-green-50 px-2 py-1.5 text-xs text-green-900">
               <HiCheckCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
               />
               <span>
                  São 16 dias corridos ou mais — esta missão sozinha fecharia o
                  módulo.
               </span>
            </p>
         )}
      </div>
   );
}
