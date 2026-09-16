"use client";

import { useState } from "react";
import Link from "next/link";
import {
   HiExclamation,
   HiArrowNarrowRight,
   HiOutlineClock,
   HiRefresh,
} from "react-icons/hi";
import clsx from "clsx";
import { useEtapasPendentes } from "@/hooks/queries";

/** Teto do backend — vem tudo de uma vez e a lista é fatiada no cliente. */
const LIMIT = 100;
/** Quantas missões aparecem antes de "+N". */
const VISIVEIS = 8;

interface EtapasPendentesAlertProps {
   /** Janela de datas visível na tela — não filtra a busca, só marca o
       que está fora dela. */
   dataIni: string;
   dataFim: string;
}

export function EtapasPendentesAlert({
   dataIni,
   dataFim,
}: EtapasPendentesAlertProps) {
   const [expandido, setExpandido] = useState(false);
   const { data, isError, refetch, isFetching } = useEtapasPendentes(LIMIT);

   // Falha de carga NÃO pode se parecer com "nada pendente": o componente
   // existe justamente para impedir que pendência passe batido.
   if (isError) {
      return (
         <section
            role="alert"
            className="mb-4 flex shrink-0 flex-wrap items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-sm"
         >
            <HiExclamation aria-hidden className="h-4 w-4 text-slate-400" />
            Não foi possível verificar as etapas pendentes.
            <button
               type="button"
               onClick={() => refetch()}
               disabled={isFetching}
               className="focus-visible:ring-primary-500 inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 disabled:opacity-50"
            >
               <HiRefresh
                  aria-hidden
                  className={clsx("h-3 w-3", isFetching && "animate-spin")}
               />
               Tentar novamente
            </button>
         </section>
      );
   }

   if (!data || data.total === 0) return null;

   const { total, total_missoes, missoes } = data;
   const visiveis = expandido ? missoes : missoes.slice(0, VISIVEIS);
   const ocultas = total_missoes - visiveis.length;
   // Acima do teto do backend o expandir não alcança tudo — dizer isso é
   // melhor do que sumir com o resto em silêncio.
   const naoListadas = total_missoes - missoes.length;

   // `mb-4` mora na própria section (e não num wrapper na página) porque o
   // alerta some por completo quando não há pendência — no pai deixaria um
   // vão morto. `shrink-0`: o pai é um flex-col com overflow.
   return (
      <section
         aria-label="Pendências de verificação"
         className="relative mb-4 shrink-0 overflow-hidden rounded border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm"
      >
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-amber-500"
         />

         <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* O ping é o que chama atenção. `motion-safe:` porque é
                decorativo — quem pediu menos movimento fica com o ponto
                estático, sem perder o sinal. */}
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700 ring-1 ring-amber-200 ring-inset">
               <HiExclamation className="h-5 w-5" />
               <span
                  aria-hidden
                  className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
               >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-600" />
               </span>
            </span>

            <div className="min-w-0 flex-1 space-y-2">
               {/* A live region é só a frase-resumo: envolver a lista de
                   links faria o leitor de tela reler tudo a cada expandir */}
               <p
                  role="status"
                  className="text-sm font-semibold text-amber-900"
               >
                  {total === 1
                     ? "1 etapa pendente de verificação"
                     : `${total} etapas pendentes de verificação`}
               </p>

               <ul
                  className={clsx(
                     "flex flex-wrap items-center gap-1.5",
                     expandido && "max-h-40 overflow-y-auto"
                  )}
               >
                  {visiveis.map((missao) => {
                     // A missão só entra aqui com etapa pendente, então o
                     // intervalo já é o das pendências: se ele escapa da
                     // janela da tela, é pendência que ficou invisível.
                     const fora =
                        missao.primeira_data < dataIni ||
                        missao.ultima_data > dataFim;
                     const nome =
                        missao.titulo ?? `Missão #${missao.missao_id}`;
                     return (
                        <li key={missao.missao_id}>
                           <Link
                              href={`/estatistica/etapas/missao/${missao.missao_id}?etapa=${missao.etapa_id}`}
                              prefetch={false}
                              title={`Abrir ${nome} — ${missao.total} etapa(s) pendente(s)${fora ? ", fora do período filtrado" : ""}`}
                              className={clsx(
                                 "group focus-visible:ring-primary-500 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2",
                                 fora
                                    ? "border-amber-500 bg-amber-100 text-amber-900 hover:bg-amber-200"
                                    : "border-amber-300 bg-white text-amber-900 hover:border-amber-400 hover:bg-amber-100"
                              )}
                           >
                              {fora && (
                                 <HiOutlineClock
                                    aria-hidden
                                    className="h-3.5 w-3.5 shrink-0 text-amber-700"
                                 />
                              )}
                              <span className="max-w-[12rem] truncate">
                                 {nome}
                              </span>
                              <span
                                 className={clsx(
                                    "rounded-full px-1.5 font-mono text-[10px] text-amber-900 transition-colors",
                                    fora
                                       ? "bg-amber-300/70"
                                       : "bg-amber-100 group-hover:bg-amber-200"
                                 )}
                              >
                                 {missao.total}
                              </span>
                              <HiArrowNarrowRight
                                 aria-hidden
                                 className="h-3 w-3 shrink-0 transition-opacity pointer-fine:opacity-40 pointer-fine:group-hover:opacity-100"
                              />
                           </Link>
                        </li>
                     );
                  })}

                  {(ocultas > 0 || expandido) && (
                     <li>
                        <button
                           type="button"
                           onClick={() => setExpandido((v) => !v)}
                           aria-expanded={expandido}
                           className="focus-visible:ring-primary-500 inline-flex items-center rounded border border-dashed border-amber-300 px-2 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2"
                        >
                           {expandido
                              ? "Mostrar menos"
                              : `+${ocultas} ${ocultas > 1 ? "missões" : "missão"}`}
                        </button>
                     </li>
                  )}

                  {expandido && naoListadas > 0 && (
                     <li className="text-xs text-amber-700">
                        e mais {naoListadas} não listadas
                     </li>
                  )}
               </ul>
            </div>
         </div>
      </section>
   );
}
