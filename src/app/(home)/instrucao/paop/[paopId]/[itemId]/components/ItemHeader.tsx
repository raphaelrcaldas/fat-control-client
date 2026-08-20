"use client";

import Link from "next/link";
import { Button } from "flowbite-react";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa6";
import { formatDateFull } from "@/../utils/dateHandler";
import { PermBased } from "../../../../../hooks/usePermBased";
import {
   FuncBadge,
   TipoBadge,
} from "../../../../subprogramas/components/SubprogramaBadges";
import type {
   Paop,
   PaopSubprogramaItem,
} from "services/routes/instrucao/paops";

interface ItemHeaderProps {
   paop: Paop;
   item: PaopSubprogramaItem;
   isBusy: boolean;
   onMatricular: () => void;
}

export function ItemHeader({
   paop,
   item,
   isBusy,
   onMatricular,
}: ItemHeaderProps) {
   const { subprograma } = item;

   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative space-y-3">
            <Link
               href="/instrucao/paop"
               className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 text-xs font-semibold"
            >
               <FaArrowLeft className="size-3" aria-hidden />
               PAOP {paop.ano}
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     {subprograma.codigo}
                  </span>
                  <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     {subprograma.descricao}
                  </h1>
               </div>

               <PermBased resource="instrucao-paop" requiredPerm="update">
                  <Button
                     color="primary"
                     onClick={onMatricular}
                     disabled={isBusy}
                     className="font-semibold whitespace-nowrap"
                  >
                     <FaUserPlus className="mr-2 h-4 w-4" />
                     Matricular
                  </Button>
               </PermBased>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
               <TipoBadge tipo={subprograma.tipo} />
               <FuncBadge func={subprograma.func} />
               <span className="text-sm text-slate-600 tabular-nums">
                  {formatDateFull(paop.data_ini)} —{" "}
                  {formatDateFull(paop.data_fim)}
               </span>
               {subprograma.observacoes && (
                  <span className="text-sm text-slate-500">
                     {subprograma.observacoes}
                  </span>
               )}
            </div>
         </div>
      </header>
   );
}
