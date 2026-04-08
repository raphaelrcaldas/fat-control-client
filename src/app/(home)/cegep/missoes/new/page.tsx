"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useMissao } from "@/hooks/queries/useMissoes";
import { MissionPage } from "../components/MissionPage";
import { useMemo } from "react";
import { Missao } from "services/routes/cegep/missoes";

export default function NovaMissaoPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const cloneFromId = Number(searchParams.get("clone_from")) || 0;

   const { data: cloneSource, isLoading } = useMissao(cloneFromId);

   const clonedMissao = useMemo<Missao | null>(() => {
      if (!cloneSource) return null;
      return { ...cloneSource, id: undefined, users: [] };
   }, [cloneSource]);

   const handleNavigateBack = () => {
      router.back();
   };

   if (cloneFromId > 0 && isLoading) {
      return (
         <div className="flex h-96 items-center justify-center">
            <Spinner size="xl" color="failure" />
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
