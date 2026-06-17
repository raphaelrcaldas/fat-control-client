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
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <span className="text-sm font-bold text-red-600 uppercase">
                     {user.p_g}
                  </span>
               </div>
               <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase">
                     {user.nome_guerra}
                  </h3>
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
            >
               <IoMdInformationCircleOutline className="h-5 w-5 text-red-600" />
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
               <Badge color="red" className="text-xs">
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
