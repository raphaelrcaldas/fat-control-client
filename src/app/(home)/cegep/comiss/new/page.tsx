"use client";

import { useRouter } from "next/navigation";
import { ComissForm } from "../components/ComissForm";

export default function NewComissPage() {
   const router = useRouter();

   return (
      <ComissForm
         onCancel={() => router.back()}
         onSuccess={() => router.push("/cegep/comiss")}
      />
   );
}
