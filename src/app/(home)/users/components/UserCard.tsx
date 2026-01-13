"use client";

import { useState } from "react";
import { Badge, Button } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./UserDetailsModal/index";

interface UserCardProps {
   user: UserPublic;
}

export function UserCard({ user }: UserCardProps) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-150 hover:shadow-md">
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
                  onClick={() => setShowUser(true)}
                  aria-label={`Ver detalhes de ${user.nome_guerra}`}
                  className="p-0"
               >
                  <IoMdInformationCircleOutline className="h-5 w-5 text-red-600" />
               </Button>
            </div>

            <div className="grid grid-cols-4 gap-2 border-t border-gray-100 pt-3">
               <div>
                  <p className="mb-1 text-xs text-gray-500">Posto/Graduação</p>
                  <Badge color="gray" className="text-xs capitalize">
                     {user.posto.long}
                  </Badge>
               </div>
               <div>
                  <p className="mb-1 text-xs text-gray-500">Especialidade</p>
                  <Badge color="gray" className="text-xs uppercase">
                     {user.esp}
                  </Badge>
               </div>
               <div>
                  <p className="mb-1 text-xs text-gray-500">Unidade</p>
                  <Badge color="red" className="text-xs uppercase">
                     {user.unidade}
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
         {showUser && (
            <UserDetailsModal
               show={showUser}
               setShow={setShowUser}
               user={user}
            />
         )}
      </>
   );
}
