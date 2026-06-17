"use client";

import { Badge, Button } from "flowbite-react";
import { HiClipboardList, HiRefresh } from "react-icons/hi";

interface LogsHeaderProps {
   count: number;
   lastUpdated?: number;
   isFetching: boolean;
   onRefresh: () => void;
}

export function LogsHeader({
   count,
   lastUpdated,
   isFetching,
   onRefresh,
}: LogsHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha vermelha — ecoa a espinha dos cards */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <HiClipboardList className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Logs
                  </h1>
                  {lastUpdated && (
                     <span className="block text-sm text-gray-500">
                        Última atualização:{" "}
                        {new Date(lastUpdated).toLocaleTimeString("pt-BR")}
                     </span>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Badge color="red" size="lg">
                  {count} {count === 1 ? "registro" : "registros"}
               </Badge>
               <Button
                  color="red"
                  onClick={onRefresh}
                  disabled={isFetching}
                  className="font-semibold whitespace-nowrap"
               >
                  <HiRefresh
                     className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                  Atualizar
               </Button>
            </div>
         </div>
      </header>
   );
}
