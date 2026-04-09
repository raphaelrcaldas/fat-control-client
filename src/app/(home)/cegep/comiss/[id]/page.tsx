"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useComissDetail } from "@/hooks/queries";
import { ComissPage } from "../components/ComissPage";
import { ComissForm } from "../components/ComissForm";

export default function ComissDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const comissId = Number(params.id);
   const [isEditMode, setIsEditMode] = useState(false);

   const { data: comiss, isLoading } = useComissDetail(comissId);

   const handleNavigateBack = () => {
      router.back();
   };

   if (isLoading) {
      return (
         <div className="flex h-96 items-center justify-center">
            <Spinner size="xl" color="failure" />
         </div>
      );
   }

   if (!comiss) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Comissionamento nao encontrado.
            </p>
            <button
               onClick={handleNavigateBack}
               className="text-sm font-medium text-red-600 hover:underline"
            >
               Voltar para lista de comissionamentos
            </button>
         </div>
      );
   }

   if (isEditMode) {
      return (
         <ComissForm
            comiss={comiss}
            onCancel={() => setIsEditMode(false)}
            onSuccess={() => setIsEditMode(false)}
         />
      );
   }

   return (
      <ComissPage
         detail={comiss}
         onEdit={() => setIsEditMode(true)}
         onClose={handleNavigateBack}
      />
   );
}
