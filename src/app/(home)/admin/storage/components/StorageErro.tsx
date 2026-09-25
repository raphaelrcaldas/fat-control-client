"use client";

import { Alert, Button } from "flowbite-react";
import { HiExclamation, HiRefresh } from "react-icons/hi";
import { formatHoraLocal } from "@/../utils/dateHandler";

// Mesma string do fallback em services/routes/storage.ts — comparada abaixo
// para não imprimir a frase duas vezes quando o backend não manda `message`.
const TITULO_ERRO = "Não foi possível ler o storage.";

interface StorageErroProps {
   error: unknown;
   isFetching: boolean;
   onRetry: () => void;
   /** Epoch da última leitura boa ainda na tela. Ausente = não há dado. */
   leituraAnterior?: number;
}

export function StorageErro({
   error,
   isFetching,
   onRetry,
   leituraAnterior,
}: StorageErroProps) {
   const detalhe =
      error instanceof Error && error.message !== TITULO_ERRO
         ? error.message
         : "";

   return (
      // max-w-5xl: mesma borda direita do card de uso logo abaixo
      <Alert color="failure" icon={HiExclamation} className="max-w-5xl">
         <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
               <span className="font-semibold">
                  {leituraAnterior
                     ? "Não foi possível atualizar o storage."
                     : TITULO_ERRO}
               </span>{" "}
               {detalhe}
               {leituraAnterior && (
                  <>
                     {" "}
                     Os números abaixo são da leitura das{" "}
                     {formatHoraLocal(leituraAnterior)}.
                  </>
               )}
            </span>
            <Button
               color="light"
               size="sm"
               onClick={onRetry}
               disabled={isFetching}
            >
               <HiRefresh className="mr-2 size-4" />
               Tentar novamente
            </Button>
         </div>
      </Alert>
   );
}
