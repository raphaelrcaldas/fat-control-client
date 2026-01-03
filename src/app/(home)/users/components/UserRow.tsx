"use client";

import { useState } from "react";
import { Badge, Button } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./UserDetailsModal/index";

interface UserRowProps {
   user: UserPublic;
   update: () => void;
}

export function UserRow({ user, update }: UserRowProps) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <tr className="border-b border-gray-100 transition-colors duration-150 last:border-gray-300 hover:bg-gray-50">
            <td className="px-4 py-3 font-mono text-gray-400">{user.id}</td>
            <td className="px-4 py-3">{user.posto.mid}</td>
            <td className="px-4 py-3 text-gray-600 uppercase">{user.esp}</td>
            <td className="px-4 py-3 font-medium text-gray-900 uppercase">
               {user.nome_guerra}
            </td>
            <td className="px-4 py-3 text-gray-600 capitalize">
               {user.nome_completo}
            </td>
            <td className="px-4 py-3 uppercase">{user.unidade}</td>
            <td className="px-4 py-3">
               <div className="flex justify-start">
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
            </td>
            <td className="px-4 py-3 text-right">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => setShowUser(true)}
                  aria-label={`Ver detalhes de ${user.nome_guerra}`}
                  title="Ver detalhes"
               >
                  <IoMdInformationCircleOutline
                     size={20}
                     className="text-red-600"
                  />
               </Button>
            </td>
         </tr>
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
