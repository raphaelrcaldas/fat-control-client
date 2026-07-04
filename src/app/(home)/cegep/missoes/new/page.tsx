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

   const { data: cloneSource, isLoading } = useMissao(cloneFromId);

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

   return (
      <MissionPage
         missao={cloneFromId > 0 ? clonedMissao : null}
         initialEdit={true}
         onClose={handleNavigateBack}
      />
   );
}
