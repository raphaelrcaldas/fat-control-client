"use client";

import { useParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useMissao } from "@/hooks/queries/useMissoes";
import { MissionPage } from "../components/MissionPage";

export default function MissaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const missaoId = Number(params.id);
   const { data: missao, isLoading } = useMissao(missaoId);

   const handleNavigateBack = () => {
      router.back();
   };

   const handleClone = () => {
      router.push(`/cegep/missoes/new?clone_from=${missaoId}`);
   };

   if (isLoading) {
      return (
         <div className="flex h-96 items-center justify-center">
            <Spinner size="xl" color="failure" />
         </div>
      );
   }

   if (!missao) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">Missão não encontrada.</p>
            <button
               onClick={handleNavigateBack}
               className="text-sm font-medium text-red-600 hover:underline"
            >
               Voltar para lista de missões
            </button>
         </div>
      );
   }

   return (
      <MissionPage
         missao={missao}
         initialEdit={false}
         onClose={handleNavigateBack}
         onClone={handleClone}
      />
   );
}
