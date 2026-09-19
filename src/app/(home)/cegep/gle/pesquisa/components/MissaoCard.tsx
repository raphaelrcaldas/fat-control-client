"use client";

import { useState } from "react";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi";
import { TbPlaneInflight } from "react-icons/tb";

import { isoDateToString } from "@/../utils/dateHandler";
import type { MissaoComLocEsp } from "services/routes/cegep/glePesquisa";

import { GrupoBadge } from "../../localidades/components/GrupoBadge";

interface MissaoCardProps {
   missao: MissaoComLocEsp;
}

/**
 * Uma missão que passou por localidade especial.
 *
 * A pergunta é binária — passou ou não —, então o cartão afirma **onde**
 * antes de tudo: as localidades são o título visual, e as etapas ficam
 * recolhidas como evidência de quando/como o contato aconteceu.
 */
export function MissaoCard({ missao }: MissaoCardProps) {
   const [aberto, setAberto] = useState(false);

   const periodo =
      missao.primeira_data === missao.ultima_data
         ? isoDateToString(missao.primeira_data)
         : `${isoDateToString(missao.primeira_data)} – ${isoDateToString(missao.ultima_data)}`;

   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex flex-wrap items-start justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
               {/* O `titulo` da missão é a Ordem de Missão — o identificador
                   que o usuário reconhece e procura. O id interno do banco
                   não é exibido: não significa nada para quem consulta. */}
               <div className="flex items-baseline gap-2">
                  {missao.titulo ? (
                     <span
                        className="font-mono text-base font-bold tracking-tight text-slate-900"
                        title={`Ordem de Missão ${missao.titulo}`}
                     >
                        OM {missao.titulo}
                     </span>
                  ) : (
                     <span className="text-sm text-slate-400 italic">
                        sem OM cadastrada
                     </span>
                  )}
                  <span className="text-xs whitespace-nowrap text-slate-500">
                     {periodo}
                  </span>
               </div>

               {/* As localidades são a resposta à pergunta */}
               <ul className="mt-2 flex flex-wrap gap-1.5">
                  {missao.localidades.map((loc) => (
                     <li
                        key={loc.loc_esp_id}
                        className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 py-1 pr-2 pl-1"
                     >
                        <GrupoBadge grupo={loc.grupo} />
                        <span className="text-sm font-medium text-slate-800">
                           {loc.cidade}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                           {loc.uf}
                        </span>
                     </li>
                  ))}
               </ul>
            </div>

            <button
               type="button"
               onClick={() => setAberto((v) => !v)}
               aria-expanded={aberto}
               className="inline-flex min-h-[24px] shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
               {missao.total_etapas}{" "}
               {missao.total_etapas === 1 ? "etapa" : "etapas"}
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
               {missao.etapas.map((etapa) => (
                  <li
                     key={etapa.etapa_id}
                     className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs"
                  >
                     <span className="font-mono whitespace-nowrap text-slate-500">
                        {isoDateToString(etapa.data)}
                     </span>

                     <span className="flex items-center gap-1.5 font-mono font-semibold">
                        <Ponta
                           icao={etapa.origem}
                           especial={etapa.icaos_loc_esp.includes(etapa.origem)}
                        />
                        <TbPlaneInflight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <Ponta
                           icao={etapa.destino}
                           especial={etapa.icaos_loc_esp.includes(
                              etapa.destino
                           )}
                        />
                     </span>

                     <span className="font-mono text-slate-500">
                        {etapa.anv}
                     </span>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}

/** Ponta da etapa: a que é localidade especial ganha destaque. */
function Ponta({ icao, especial }: { icao: string; especial: boolean }) {
   return (
      <span
         className={clsx(
            "rounded px-1.5 py-0.5",
            especial
               ? "bg-slate-800 text-white"
               : "border border-slate-200 bg-white text-slate-600"
         )}
         title={especial ? `${icao} — localidade especial` : icao}
      >
         {icao}
      </span>
   );
}
