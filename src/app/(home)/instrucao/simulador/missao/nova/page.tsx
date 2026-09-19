"use client";

import { useSearchParams } from "next/navigation";

import PermDenied from "@/app/components/permDenied";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { NovaMissaoSimulador } from "../components/NovaMissaoSimulador";

export default function NovaMissaoSimuladorPage() {
   const searchParams = useSearchParams();

   // O botao que leva aqui ja e gateado, mas a rota continua alcancavel por
   // URL direta. Sem este guard, quem so tem `view` aterrissa num formulario
   // editavel que nunca vai salvar — o 403 do backend so apareceria depois do
   // trabalho todo preenchido.
   const { hasPerm } = usePermBased();

   if (!hasPerm("estatistica.etapas", "create")) {
      return (
         <div className="space-y-2">
            <PermDenied />
         </div>
      );
   }

   // A sessao precisa cair no ano exibido na listagem; sem isso ela some do
   // filtro data_ini/data_fim logo apos ser criada e parece nao ter salvo.
   const anoParam = Number(searchParams.get("ano"));
   const anoRef =
      Number.isFinite(anoParam) && anoParam > 0
         ? anoParam
         : new Date().getFullYear();

   return (
      <div className="space-y-2">
         <NovaMissaoSimulador anoRef={anoRef} />
      </div>
   );
}
