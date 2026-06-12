"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrdem } from "@/hooks/queries";
import { OrdemFormContent } from "../../components/OrdemDetail";
import { OrdemDetailSkeleton } from "../../components/OrdemDetail/OrdemDetailSkeleton";

export default function ClonarOrdemPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const ordemId = Number(params.id);
   const { data: ordem, isLoading } = useOrdem(ordemId);

   const handleNavigateBack = () => {
      router.push("/ops/om");
   };

   if (isLoading) {
      return <OrdemDetailSkeleton />;
   }

   if (!ordem) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Ordem de Missao nao encontrada para clonar.
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
         isNew={true}
         isCloning={true}
      />
   );
}
