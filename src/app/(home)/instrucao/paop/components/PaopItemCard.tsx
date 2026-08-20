"use client";

import Link from "next/link";
import { FaChevronRight, FaUserGroup } from "react-icons/fa6";
import {
   FuncBadge,
   TipoBadge,
} from "../../subprogramas/components/SubprogramaBadges";
import type { PaopSubprogramaItem } from "services/routes/instrucao/paops";

interface PaopItemCardProps {
   paopId: number;
   item: PaopSubprogramaItem;
}

/** Linha do plano: identifica o subprograma e leva à página dele. */
export function PaopItemCard({ paopId, item }: PaopItemCardProps) {
   const { subprograma, tripulantes } = item;

   return (
      <Link
         href={`/instrucao/paop/${paopId}/${item.id}`}
         className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
         <span className="font-mono text-sm font-bold whitespace-nowrap text-slate-800">
            {subprograma.codigo}
         </span>
         <span className="min-w-0 flex-1 truncate font-semibold text-slate-800">
            {subprograma.descricao}
         </span>

         <span className="flex items-center gap-1.5 text-sm text-slate-500 tabular-nums">
            <FaUserGroup className="size-3.5" aria-hidden />
            {tripulantes.length}
            <span className="sr-only">
               {tripulantes.length === 1 ? "matriculado" : "matriculados"}
            </span>
         </span>

         <TipoBadge tipo={subprograma.tipo} />
         <FuncBadge func={subprograma.func} />

         <FaChevronRight className="size-3.5 text-slate-400" aria-hidden />
      </Link>
   );
}
