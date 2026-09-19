"use client";

import { useParams } from "next/navigation";

import { MissaoEditor } from "../MissaoEditor";

export default function MissaoPage() {
   const params = useParams<{ id: string }>();
   const id = Number(params.id);

   // Id não numérico na URL: não chama a API com NaN.
   if (!Number.isFinite(id)) {
      return (
         <div
            className="rounded border border-slate-200 bg-white p-4 text-sm text-red-800 shadow-sm"
            role="alert"
         >
            Missão inválida.
         </div>
      );
   }

   return <MissaoEditor missaoId={id} />;
}
