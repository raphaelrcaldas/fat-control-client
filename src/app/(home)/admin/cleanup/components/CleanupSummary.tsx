"use client";

import { Button, Spinner } from "flowbite-react";
import { MdAutoDelete } from "react-icons/md";
import clsx from "clsx";

interface CleanupSummaryProps {
   totalRecords: number;
   loading: boolean;
   running: boolean;
   onRun: () => void;
}

export function CleanupSummary({
   totalRecords,
   loading,
   running,
   onRun,
}: CleanupSummaryProps) {
   return (
      <div className="flex flex-col gap-4 rounded border border-slate-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
         <div className="space-y-1">
            <p className="text-sm text-gray-500">
               Total de registros candidatos à limpeza
            </p>
            <p
               className={clsx(
                  "text-4xl font-bold",
                  totalRecords > 0 ? "text-red-600" : "text-green-600"
               )}
            >
               {loading ? "..." : totalRecords.toLocaleString("pt-BR")}
            </p>
            {!loading && totalRecords === 0 && (
               <p className="text-sm text-green-600">
                  Banco de dados sem registros pendentes
               </p>
            )}
         </div>
         <Button
            color="red"
            disabled={running || loading || totalRecords === 0}
            onClick={onRun}
         >
            {running ? (
               <>
                  <Spinner size="sm" color="primary" />
                  <span className="ml-2">Executando...</span>
               </>
            ) : (
               <>
                  <MdAutoDelete className="mr-2 size-5" />
                  Executar Limpeza
               </>
            )}
         </Button>
      </div>
   );
}
