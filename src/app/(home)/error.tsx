"use client";

import { useEffect } from "react";
import { Button } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";

// Error boundary do segmento (home): erros de runtime não derrubam o shell
// (navbar/sidebar do layout continuam de pé) e o usuário pode tentar de novo
export default function HomeError({
   error,
   reset,
}: {
   error: Error & { digest?: string };
   reset: () => void;
}) {
   useEffect(() => {
      console.error("Erro não tratado na página:", error);
   }, [error]);

   return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded border border-slate-200 bg-white p-8 shadow-sm">
         <HiExclamationCircle className="h-10 w-10 text-red-500" />
         <p className="text-lg font-semibold text-gray-900">Algo deu errado</p>
         <p className="max-w-md text-center text-sm text-gray-500">
            Ocorreu um erro inesperado ao carregar esta página. Tente novamente;
            se o problema persistir, contate o administrador.
         </p>
         <Button color="light" onClick={reset}>
            Tentar novamente
         </Button>
      </div>
   );
}
