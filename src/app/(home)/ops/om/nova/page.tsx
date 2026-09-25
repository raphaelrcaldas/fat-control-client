"use client";

import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { useFuncoes } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { OrdemFormContent } from "../components/OrdemDetail/OrdemFormContent";
import { OrdemDetailSkeleton } from "../components/OrdemDetail/OrdemDetailSkeleton";
import { getOmListUrl } from "../utils/omListUrl";

export default function NovaOrdemPage() {
   const router = useRouter();
   const { push: pushToast } = useToast();
   // Catálogo de funções operadas pela unidade: define as colunas da
   // tripulação. Sem esperar por ele, `useOrdemForm` monta o estado inicial
   // com `tripulacao = {}` e o F5 nesta rota crasha (ver ordemFormUtils.ts).
   const funcoes = useFuncoes();

   const handleNavigateBack = () => {
      // Volta para a lista preservando tab/página/filtros
      router.push(getOmListUrl());
   };

   // Aprovar OM nova cria o rascunho e depois tenta a transição para
   // aprovada; se a transição falhar, o rascunho já existe no backend — em
   // vez de deixar a tela em /nova (onde um novo clique criaria outro
   // rascunho duplicado), navega para o rascunho recém-criado com um aviso.
   const handleDraftCreated = (id: number, message: string) => {
      pushToast({
         type: "warning",
         title: "Aprovação não concluída",
         message: `Rascunho criado, mas a aprovação falhou: ${message}`,
      });
      router.replace(`/ops/om/${id}`);
   };

   if (funcoes.isLoading) {
      return <OrdemDetailSkeleton />;
   }

   // Só troca o formulário pela tela de erro quando não há catálogo: no
   // TanStack v5 `isError` continua true com `data` em cache se um refetch
   // em segundo plano falhar (reconexão, `useFuncoes()` do TripulanteSelect)
   // — desmontar o formulário aí descartaria a OM sendo preenchida.
   if (funcoes.isError && funcoes.funcoes.length === 0) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Erro ao carregar as funções da unidade.
            </p>
            <div className="flex items-center gap-3">
               <Button color="light" onClick={() => funcoes.refetch()}>
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

   return (
      <OrdemFormContent
         ordem={null}
         onSave={handleNavigateBack}
         onClose={handleNavigateBack}
         isNew={true}
         onDraftCreated={handleDraftCreated}
      />
   );
}
