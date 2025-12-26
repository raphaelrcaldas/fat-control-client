"use client";

import { useState } from "react";
import { Badge } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./UserDetailsModal";

interface UserCardProps {
   user: UserPublic;
   update: () => void;
}

export function UserCard({ user, update }: UserCardProps) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-150">
            <div className="flex items-start justify-between mb-3">
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                     <span className="text-red-600 font-bold text-sm uppercase">
                        {user.p_g}
                     </span>
                  </div>
                  <div>
                     <h3 className="font-semibold text-gray-900 uppercase text-sm">
                        {user.nome_guerra}
                     </h3>
                     <p className="text-xs text-gray-500 capitalize">
                        {user.nome_completo}
                     </p>
                  </div>
               </div>
               <button
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => setShowUser(true)}
                  aria-label={`Ver detalhes de ${user.nome_guerra}`}
               >
                  <IoMdInformationCircleOutline size={22} />
               </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
               <div>
                  <p className="text-xs text-gray-500 mb-1">Posto/Graduação</p>
                  <Badge color="gray" className="capitalize text-xs">
                     {user.posto.long}
                  </Badge>
               </div>
               <div>
                  <p className="text-xs text-gray-500 mb-1">Especialidade</p>
                  <Badge color="gray" className="uppercase text-xs">
                     {user.esp}
                  </Badge>
               </div>
               <div>
                  <p className="text-xs text-gray-500 mb-1">Unidade</p>
                  <Badge color="red" className="uppercase text-xs">
                     {user.unidade}
                  </Badge>
               </div>
               <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
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
               updateUsers={update}
               user={user}
            />
         )}
      </>
   );
}
