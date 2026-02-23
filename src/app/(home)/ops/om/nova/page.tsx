"use client";

import { useRouter } from "next/navigation";
import { OrdemFormContent } from "../components/OrdemDetail";

export default function NovaOrdemPage() {
   const router = useRouter();

   const handleNavigateBack = () => {
      router.push("/ops/om");
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
