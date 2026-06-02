"use client";

import Link from "next/link";
import { Button } from "flowbite-react";
import { FaLock } from "react-icons/fa6";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ForbiddenPage() {
   return (
      <div className="mx-auto max-w-lg py-12">
         <EmptyState
            icon={FaLock}
            title="Acesso negado"
            description="Você não tem permissão para acessar esta página no contexto atual. Verifique a organização ativa ou seu perfil de acesso."
            action={
               <Button as={Link} href="/" color="red">
                  Voltar ao início
               </Button>
            }
         />
      </div>
   );
}
