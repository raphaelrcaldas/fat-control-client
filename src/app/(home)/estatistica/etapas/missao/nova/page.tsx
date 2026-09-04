"use client";

import PermDenied from "@/app/components/permDenied";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { MissaoDraftProvider } from "../context/MissaoDraftContext";
import { emptyDraft } from "../context/serverMappers";
import { MissaoEditor } from "../components/MissaoEditor";

export default function NovaMissaoPage() {
   const { hasPerm } = usePermBased();

   // O botao que leva aqui ja e gateado, mas a rota continua alcancavel por
   // URL direta. Sem este guard, quem so tem `view` aterrissa num formulario
   // editavel que nunca vai salvar — o 403 do backend so apareceria depois do
   // trabalho todo preenchido.
   if (!hasPerm("estatistica.etapas", "create")) {
      return <PermDenied />;
   }

   return (
      <MissaoDraftProvider initialDraft={emptyDraft()}>
         <MissaoEditor mode="new" />
      </MissaoDraftProvider>
   );
}
