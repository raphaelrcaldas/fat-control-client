import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { TripFuncBadge } from "./TripFuncBadge";
import type { Trip } from "../types/trip.types";

type TripCardProps = {
   trip: Trip;
};

/**
 * Linha da lista no mobile.
 *
 * A tabela some abaixo de `md` porque as colunas de nome eram as primeiras a
 * cair: no celular a tela mostrava posto, trigrama e funcao — ninguem para
 * quem o trigrama nao seja de cor. Aqui o nome e o primeiro dado, e a linha
 * inteira e o alvo de toque.
 */
export function TripCard({ trip }: TripCardProps) {
   const user = trip.user;
   const href = trip.id != null ? `/ops/trip/${trip.id}` : null;

   const content = (
      <>
         <span className="w-9 shrink-0 text-sm font-bold text-slate-600 uppercase">
            {user.posto.short}
         </span>

         <span className="min-w-0 flex-1">
            <span
               className="block truncate font-semibold text-slate-800 capitalize"
               title={user.nome_guerra}
            >
               {user.nome_guerra}
            </span>
            <span
               className="block truncate text-xs leading-5 text-slate-500 capitalize"
               title={user.nome_completo ?? undefined}
            >
               {user.nome_completo}
            </span>
         </span>

         <span className="shrink-0">
            <TripFuncBadge func={trip.func} oper={trip.oper} />
         </span>

         <HiChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
      </>
   );

   if (!href) {
      return (
         <div className="flex items-center gap-3 px-4 py-2.5">{content}</div>
      );
   }

   return (
      <Link
         href={href}
         className="focus-visible:outline-primary-600 flex items-center gap-3 px-4 py-2.5 outline-none focus-visible:outline-[2px] focus-visible:-outline-offset-2 focus-visible:[outline-style:solid] active:bg-slate-50"
      >
         {content}
      </Link>
   );
}
