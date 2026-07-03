"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { useOrdem } from "@/hooks/queries";
import { OrdemFormContent } from "../components/OrdemDetail/OrdemFormContent";
import { OrdemDetailSkeleton } from "../components/OrdemDetail/OrdemDetailSkeleton";
import { getOmListUrl } from "../utils/omListUrl";

export default function OrdemDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   // id inválido na URL não deve virar NaN silencioso nem request ao backend
   const ordemId = /^\d+$/.test(params.id) ? Number(params.id) : null;
   const { data: ordem, isLoading, isError, refetch } = useOrdem(ordemId);

   // Título da aba com o número da OM (identifica a aba entre várias OMs
   // abertas; a navegação de volta restaura o título default do app)
   useEffect(() => {
      if (ordem?.numero && ordem.numero !== "auto") {
         document.title = `OM ${ordem.numero} | FATCONTROL`;
      }
   }, [ordem?.numero]);

   const handleNavigateBack = () => {
      // Volta para a lista preservando tab/página/filtros (URL gravada pela
      // própria lista em sessionStorage; fallback /ops/om em acesso direto)
      router.push(getOmListUrl());
   };

   if (isLoading) {
      return <OrdemDetailSkeleton />;
   }

   // Falha de rede/servidor não é "não encontrada": oferecer retry
   if (isError) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Erro ao carregar a Ordem de Missão.
            </p>
            <div className="flex items-center gap-3">
               <Button color="light" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
               <button
                  onClick={handleNavigateBack}
                  className="text-sm font-medium text-red-600 hover:underline"
               >
                  Voltar para lista de ordens
               </button>
            </div>
         </div>
      );
   }

   if (!ordem) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Ordem de Missão não encontrada.
            </p>
            <button
               onClick={handleNavigateBack}
               className="text-sm font-medium text-red-600 hover:underline"
            >
               Voltar para lista de ordens
            </button>
         </div>
      );
   }

   return (
      <OrdemFormContent
         ordem={ordem}
         onSave={handleNavigateBack}
         onClose={handleNavigateBack}
         isNew={false}
      />
   );
}
