"use client";

import { Alert, Button } from "flowbite-react";
import { HiCurrencyDollar, HiExclamation, HiPlus } from "react-icons/hi";

interface DiariaHeaderProps {
   loading: boolean;
   error: string | null;
   valoresCount: number;
   gruposCount: number;
   onCreateClick: () => void;
}

export function DiariaHeader({
   loading,
   error,
   valoresCount,
   gruposCount,
   onCreateClick,
}: DiariaHeaderProps) {
   return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-red-100 p-2">
                  <HiCurrencyDollar className="h-6 w-6 text-red-600" />
               </div>
               <div>
                  <h5 className="text-lg font-semibold text-gray-900">
                     Gestao de Diarias
                  </h5>
                  <p className="text-sm text-gray-500">
                     {loading
                        ? "Carregando..."
                        : `${valoresCount} valor(es) | ${gruposCount} grupo(s) de cidades`}
                  </p>
               </div>
            </div>
            <Button color="red" onClick={onCreateClick}>
               <HiPlus className="mr-2 h-4 w-4" />
               Nova Diaria
            </Button>
         </div>

         {error && (
            <Alert color="failure" icon={HiExclamation} className="mt-4">
               <span className="font-medium">Erro!</span> {error}
            </Alert>
         )}
      </div>
   );
}
