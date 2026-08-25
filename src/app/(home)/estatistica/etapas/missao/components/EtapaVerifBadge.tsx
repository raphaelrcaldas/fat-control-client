"use client";

import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import clsx from "clsx";

interface EtapaVerifBadgeProps {
   /** Rótulo curto exibido na pílula (ex: "SAGEM", "PARTE 1"). */
   label: string;
   ok: boolean;
   title?: string;
}

/**
 * Pílula de verificação de uma etapa (SAGEM / Parte 1).
 *
 * Verde discreto quando cumprido — é o estado esperado e não deve competir
 * com o resto do card; âmbar quando falta, que é o que precisa ser visto.
 */
export function EtapaVerifBadge({ label, ok, title }: EtapaVerifBadgeProps) {
   const Icon = ok ? HiCheckCircle : HiExclamationCircle;
   return (
      <span
         title={title}
         className={clsx(
            "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
            ok
               ? "bg-emerald-50/70 text-emerald-700 ring-emerald-200"
               : "bg-amber-100 text-amber-900 ring-amber-300"
         )}
      >
         <Icon aria-hidden className="h-3 w-3" />
         {label}
         {/* O estado só existe em cor e formato do ícone — sem isto, quem
             usa leitor de tela lê só "SAGEM" nos dois casos */}
         <span className="sr-only">{ok ? "verificado" : "pendente"}</span>
      </span>
   );
}
