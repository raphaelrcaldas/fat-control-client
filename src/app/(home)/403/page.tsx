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
            titleAs="h1"
            description="Você não tem permissão para acessar esta página no contexto atual. Verifique a organização ativa ou seu perfil de acesso."
            action={
               // Voltar para casa é navegação, não ação destrutiva: `primary`
               // (herda o tema da org), nunca `red`
               <Button as={Link} href="/" color="primary">
                  Voltar ao início
               </Button>
            }
         />
      </div>
   );
}
