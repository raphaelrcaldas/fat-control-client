"use client";

import { memo, useEffect, useRef } from "react";
import { HiCheck, HiPencil, HiSparkles } from "react-icons/hi";
import clsx from "clsx";
import {
   formatDateFull,
   isoDateToShort,
   minutesToTime,
} from "utils/dateHandler";

import { EtapaStatusBadge } from "./EtapaStatusBadge";
import { EtapaVerifBadge } from "./EtapaVerifBadge";

export type EtapaStatus = "ok" | "verificar" | "editando" | "rascunho";

type Props = {
   /** Ordinal da etapa na missao, com zero a esquerda ("01"). */
   numero: string;
   data: string;
   origem: string;
   destino: string;
   anv: string;
   depHora: string;
   arrHora: string;
   tvooMin: number;
   status: EtapaStatus;
   sagem: boolean;
   parte1: boolean;
   selected: boolean;
   isModified?: boolean;
   isNew?: boolean;
   onClick: () => void;
};

function EtapaSidebarItemBase({
   numero,
   data,
   origem,
   destino,
   anv,
   depHora,
   arrHora,
   tvooMin,
   status,
   sagem,
   parte1,
   selected,
   isModified,
   isNew,
   onClick,
}: Props) {
   const ref = useRef<HTMLButtonElement>(null);

   // Etapa recém-adicionada (fim da lista) ou selecionada fora da área
   // visível: traz o card para a vista. `nearest` não mexe se já estiver lá
   useEffect(() => {
      if (selected) ref.current?.scrollIntoView({ block: "nearest" });
   }, [selected]);

   // Selo só para o que pede atenção; tudo em ordem vira um ✓ discreto
   const alertas = !sagem || !parte1 || status !== "ok" || isNew || isModified;

   return (
      <button
         ref={ref}
         type="button"
         onClick={onClick}
         aria-current={selected ? "true" : undefined}
         className={clsx(
            // scroll-m: o scrollIntoView deixa folga além do fade da lista
            "relative flex w-full scroll-my-4 flex-col gap-2 overflow-hidden border border-gray-200 bg-white p-3 pl-4 text-left shadow transition",
            "focus-visible:outline-primary-500 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2",
            selected &&
               "border-primary-200 bg-primary-50/40 hover:bg-primary-50/60",
            // accent bar — uses pseudo-element via ::before to avoid layout shift
            "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:transition",
            selected ? "before:bg-primary-500" : "before:bg-transparent",
            isModified &&
               !selected &&
               "before:bg-amber-300/70 before:mask-[repeating-linear-gradient(to_bottom,black_0_4px,transparent_4px_8px)]",
            isNew &&
               !selected &&
               "before:bg-emerald-300/70 before:mask-[repeating-linear-gradient(to_bottom,black_0_4px,transparent_4px_8px)]"
         )}
      >
         <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-center justify-between gap-3">
               <div className="flex min-w-0 items-center gap-1 text-sm font-semibold text-gray-900">
                  {/* No mobile o card e a unica pista de qual etapa e qual — o
                      titulo "Etapa 01" do header nunca aparece junto do drawer */}
                  <span className="mr-0.5 shrink-0 font-mono text-xs text-gray-500">
                     {numero}
                  </span>
                  <span className="truncate font-mono">{origem}</span>
                  <span className="shrink-0 text-gray-400">→</span>
                  <span className="truncate font-mono">{destino}</span>
               </div>
               <span className="shrink-0 font-mono text-xs font-medium tracking-wide text-gray-500">
                  {anv || "----"}
               </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
               <span
                  className="truncate text-gray-500"
                  title={data ? formatDateFull(data) : undefined}
               >
                  {data ? isoDateToShort(data) : "--/--"}
                  <span className="mx-1 text-gray-300">·</span>
                  {depHora === "--:--" && arrHora === "--:--"
                     ? "sem horário"
                     : `${depHora}–${arrHora}`}
               </span>
               <span className="flex shrink-0 items-center gap-1 font-mono text-sm font-semibold text-gray-900">
                  {!alertas && (
                     <HiCheck
                        role="img"
                        aria-label="OK, SAGEM e Parte 1 verificados"
                        title="OK · SAGEM e Parte 1 verificados"
                        className="h-3.5 w-3.5 text-green-600"
                     />
                  )}
                  {tvooMin > 0 ? minutesToTime(tvooMin) : "--:--"}
               </span>
            </div>
         </div>

         {/* Verificação pendente à esquerda, situação da etapa à direita.
             flex-wrap: com "Nova"/"Modificado" em cena as pílulas não cabem
             na largura da sidebar e precisam quebrar em vez de estourar */}
         {alertas && (
            <div className="flex flex-wrap items-center justify-between gap-1.5">
               <div className="flex flex-wrap items-center gap-1.5">
                  {!sagem && (
                     <EtapaVerifBadge
                        label="SAGEM"
                        ok={false}
                        title="Pendente de registro no SAGEM"
                     />
                  )}
                  {!parte1 && (
                     <EtapaVerifBadge
                        label="PARTE 1"
                        ok={false}
                        title="Relatório Parte 1 pendente"
                     />
                  )}
               </div>

               <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {isNew && (
                     <span
                        className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                        title="Esta etapa é nova e ainda não foi salva"
                     >
                        <HiSparkles className="h-3 w-3" />
                        Nova
                     </span>
                  )}
                  {isModified && (
                     <span
                        className="flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
                        title="Esta etapa foi modificada e ainda não foi salva"
                     >
                        <HiPencil className="h-3 w-3" />
                        Modificado
                     </span>
                  )}
                  {status !== "ok" && <EtapaStatusBadge status={status} />}
               </div>
            </div>
         )}
      </button>
   );
}

export const EtapaSidebarItem = memo(EtapaSidebarItemBase);
