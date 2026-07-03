"use client";

import { useRouter } from "next/navigation";
import { OrdemFormContent } from "../components/OrdemDetail/OrdemFormContent";
import { getOmListUrl } from "../utils/omListUrl";

export default function NovaOrdemPage() {
   const router = useRouter();

   const handleNavigateBack = () => {
      // Volta para a lista preservando tab/página/filtros
      router.push(getOmListUrl());
   };

   return (
      <OrdemFormContent
         ordem={null}
         onSave={handleNavigateBack}
         onClose={handleNavigateBack}
         isNew={true}
      />
   );
}
