"use client";

import Link from "next/link";
import { HiChevronRight, HiUsers } from "react-icons/hi";
import { TbMapPin } from "react-icons/tb";

import { formatNaiveDate } from "@/../utils/dateHandler";
import type { MissaoGleResumo } from "services/routes/cegep/gleMissoes";

/**
 * Uma missão salva na lista.
 *
 * O cartão inteiro é o link: o alvo de toque é a linha, não um botãozinho.
 * A OM vem em destaque porque é o número que o usuário procura — mesma
 * decisão da aba Pesquisa.
 */
export function MissaoGleCard({ missao }: { missao: MissaoGleResumo }) {
   const periodo = `${formatNaiveDate(
      missao.primeira_data
   )} – ${formatNaiveDate(missao.ultima_data)}`;

   return (
      <Link
         href={`/cegep/gle/missoes/${missao.id}`}
         className="hover:border-primary-300 block rounded border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:bg-slate-50"
      >
         <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
               <div className="flex flex-wrap items-baseline gap-2">
                  {/* A descrição é o identificador: é a OS que originou a
                      apuração, e o que o usuário procura na lista. */}
                  <span
                     className="truncate text-base font-bold tracking-tight text-slate-900"
                     title={missao.descricao}
                  >
                     {missao.descricao}
                  </span>
                  <span className="text-xs whitespace-nowrap text-slate-500">
                     {periodo}
                  </span>
                  {missao.percentual && (
                     <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                        {missao.percentual}
                     </span>
                  )}
               </div>

               <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                     <HiUsers className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                     {missao.total_militares}{" "}
                     {missao.total_militares === 1 ? "militar" : "militares"}
                  </span>
                  {missao.localidades.length > 0 && (
                     <span className="inline-flex min-w-0 items-center gap-1">
                        <TbMapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span
                           className="truncate"
                           title={missao.localidades.join(", ")}
                        >
                           {missao.localidades.join(", ")}
                        </span>
                     </span>
                  )}
               </div>
            </div>

            <HiChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
         </div>
      </Link>
   );
}
