"use client";

import { Badge, Button } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { useRouter } from "next/navigation";
import { useUnidadeOptions } from "@/hooks/queries";

interface UserCardProps {
   user: UserPublic;
}

export function UserCard({ user }: UserCardProps) {
   const router = useRouter();
   const unidadeOptions = useUnidadeOptions();

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-150 hover:shadow-md">
         <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
               {/* primary-800: o red-600 sobre red-100 media 3.91:1 — abaixo
                   do piso AA para texto de 12px bold */}
               <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-primary-800 text-sm font-bold uppercase">
                     {user.p_g}
                  </span>
               </div>
               <div>
                  {/* p, não heading: nome de linha de listagem não entra na
                      árvore de títulos (h1 → h3 saltava nível no axe) */}
                  <p className="text-sm font-semibold text-gray-900 uppercase">
                     {user.nome_guerra}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                     {user.nome_completo}
                  </p>
               </div>
            </div>
            <Button
               color="light"
               size="sm"
               onClick={() => router.push(`/users/${user.id}`)}
               aria-label={`Ver detalhes de ${user.nome_guerra}`}
               className="pointer-coarse:min-w-[44px]"
            >
               <IoMdInformationCircleOutline className="text-primary-600 h-5 w-5" />
            </Button>
         </div>

         <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
            <div>
               <p className="mb-1 text-xs text-gray-500">Quadro</p>
               <Badge color="gray" className="text-xs capitalize">
                  {user.quadro}
               </Badge>
            </div>
            <div>
               <p className="mb-1 text-xs text-gray-500">Esp</p>
               <Badge color="gray" className="text-xs uppercase">
                  {user.esp}
               </Badge>
            </div>
            <div>
               <p className="mb-1 text-xs text-gray-500">Unidade</p>
               <Badge color="primary" className="text-xs">
                  {unidadeOptions.find((u) => u.value === user.unidade)
                     ?.label || user.unidade}
               </Badge>
            </div>
            <div>
               <p className="mb-1 text-xs text-gray-500">Status</p>
               {user.active ? (
                  <Badge color="success" className="text-xs">
                     <div className="flex items-center gap-1">
                        <HiCheckCircle className="size-3" />
                        <span>Ativo</span>
                     </div>
                  </Badge>
               ) : (
                  <Badge color="gray" className="text-xs">
                     <div className="flex items-center gap-1">
                        <HiXCircle className="size-3" />
                        <span>Inativo</span>
                     </div>
                  </Badge>
               )}
            </div>
         </div>
      </div>
   );
}
