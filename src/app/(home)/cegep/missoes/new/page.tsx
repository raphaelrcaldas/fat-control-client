"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMissao } from "@/hooks/queries/useMissoes";
import { MissionPage } from "../components/MissionPage";
import { MissionPageSkeleton } from "../components/MissionPageSkeleton";
import { useMemo } from "react";
import { Missao } from "services/routes/cegep/missoes";

export default function NovaMissaoPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const cloneFromId = Number(searchParams.get("clone_from")) || 0;

   const {
      data: cloneSource,
      isLoading,
      isError,
      isFetching,
      error,
      refetch,
   } = useMissao(cloneFromId);

   const clonedMissao = useMemo<Missao | null>(() => {
      if (!cloneSource) return null;
      // Limpa tudo que pertence ao registro original: ids/frag_id dos
      // pernoites, custos em cache, flag de integridade e histórico.
      return {
         ...cloneSource,
         id: undefined,
         users: [],
         pernoites: (cloneSource.pernoites ?? []).map((p) => ({
            ...p,
            id: undefined,
            frag_id: undefined,
            custo: undefined,
         })),
         custo_inconsistente: false,
         logs: [],
      };
   }, [cloneSource]);

   const handleNavigateBack = () => {
      router.back();
   };

   if (cloneFromId > 0 && isLoading) {
      return <MissionPageSkeleton />;
   }

   // Clonagem que falha ao ler a origem: abrir o formulário em branco faria o
   // usuário achar que a missão de origem estava vazia.
   if (cloneFromId > 0 && isError && !cloneSource) {
      return (
         <div
            role="alert"
            className="flex h-96 flex-col items-center justify-center gap-4"
         >
            <p className="text-lg text-gray-500">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar a missão de origem."}
            </p>
            <div className="flex items-center gap-4">
               <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
               >
                  Tentar novamente
               </button>
               <button
                  onClick={handleNavigateBack}
                  className="text-sm font-medium text-gray-600 hover:underline"
               >
                  Voltar
               </button>
            </div>
         </div>
      );
   }

   return (
      <MissionPage
         missao={cloneFromId > 0 ? clonedMissao : null}
         initialEdit={true}
         onClose={handleNavigateBack}
      />
   );
}
