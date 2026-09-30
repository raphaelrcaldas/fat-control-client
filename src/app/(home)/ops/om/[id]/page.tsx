"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { useOrdem, useFuncoes } from "@/hooks/queries";
import { ApiError } from "services/Api";
import { OrdemFormContent } from "../components/OrdemDetail/OrdemFormContent";
import { OrdemDetailSkeleton } from "../components/OrdemDetail/OrdemDetailSkeleton";
import { getOmListUrl, hasOmInAppOrigin } from "../utils/omListUrl";

export default function OrdemDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   // id inválido na URL não deve virar NaN silencioso nem request ao backend
   const ordemId = /^\d+$/.test(params.id) ? Number(params.id) : null;
   const {
      data: ordem,
      isLoading,
      isError,
      isFetching,
      error,
      refetch,
   } = useOrdem(ordemId);
   // Catálogo de funções operadas pela unidade: define as colunas da
   // tripulação. Sem esperar por ele, `useOrdemForm` monta o estado inicial
   // com `tripulacao = {}` e crasha (ver ordemFormUtils.ts).
   const funcoes = useFuncoes();

   // Título da aba com o número da OM (identifica a aba entre várias OMs
   // abertas; a navegação de volta restaura o título default do app)
   useEffect(() => {
      if (ordem?.numero && ordem.numero !== "auto") {
         document.title = `OM ${ordem.numero} | FATCONTROL`;
      }
   }, [ordem?.numero]);

   const handleNavigateBack = () => {
      // Volta para a tela de origem (lista ou quadro) com o estado dela;
      // em acesso direto pela URL, cai na lista (ver utils/omListUrl)
      if (hasOmInAppOrigin()) {
         router.back();
      } else {
         router.push(getOmListUrl());
      }
   };

   if (isLoading || funcoes.isLoading) {
      return <OrdemDetailSkeleton />;
   }

   // 404 não é falha de rede/servidor: cai direto na tela "não encontrada",
   // sem oferecer retry para um recurso que não existe.
   const isNotFound = error instanceof ApiError && error.status === 404;

   // A tela de erro só substitui o formulário quando NÃO há dado. No
   // TanStack v5 `isError` continua true com `data` em cache se um refetch
   // em segundo plano falhar (reconexão, remontagem, `useFuncoes()` do
   // TripulanteSelect ao entrar em edição) — desmontar o formulário nesse
   // caso jogaria fora a edição não salva por causa de uma falha que o dado
   // em cache já cobre.
   const ordemFalhou = isError && !ordem && !isNotFound;
   const catalogoFalhou = funcoes.isError && funcoes.funcoes.length === 0;

   if (ordemFalhou || catalogoFalhou) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               {ordemFalhou
                  ? "Erro ao carregar a Ordem de Missão."
                  : "Erro ao carregar as funções da unidade."}
            </p>
            <div className="flex items-center gap-3">
               {/* Recarrega só o que falhou: refazer a OM não traz de volta
                   um catálogo que falhou, e vice-versa */}
               <Button
                  color="light"
                  disabled={isFetching}
                  onClick={() => {
                     if (ordemFalhou) refetch();
                     if (catalogoFalhou) funcoes.refetch();
                  }}
               >
                  Tentar novamente
               </Button>
               <button
                  onClick={handleNavigateBack}
                  className="text-primary-600 py-1 text-sm font-medium hover:underline"
               >
                  Voltar
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
               className="text-primary-600 py-1 text-sm font-medium hover:underline"
            >
               Voltar
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
