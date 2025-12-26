"use client";

import { useState } from "react";
import { Badge } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./UserDetailsModal";

interface UserRowProps {
   user: UserPublic;
   update: () => void;
}

export function UserRow({ user, update }: UserRowProps) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <tr className='border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150'>
            <td className='px-4 py-3 text-gray-400 font-mono'>{user.id}</td>
            <td className='px-4 py-3 uppercase'>{user.posto.short}</td>
            <td className='px-4 py-3 text-gray-600 uppercase'>{user.esp}</td>
            <td className='px-4 py-3 font-medium text-gray-900 uppercase'>
               {user.nome_guerra}
            </td>
            <td className='px-4 py-3 text-gray-600 capitalize'>
               {user.nome_completo}
            </td>
            <td className='px-4 py-3 text-center uppercase'>{user.unidade}</td>
            <td className='px-4 py-3'>
               <div className='flex justify-center'>
                  {user.active ? (
                     <Badge color='success' className='text-xs'>
                        <div className='flex items-center gap-1'>
                           <HiCheckCircle className='size-3' />
                           <span>Ativo</span>
                        </div>
                     </Badge>
                  ) : (
                     <Badge color='gray' className='text-xs'>
                        <div className='flex items-center gap-1'>
                           <HiXCircle className='size-3' />
                           <span>Inativo</span>
                        </div>
                     </Badge>
                  )}
               </div>
            </td>
            <td className='px-4 py-3 text-right'>
               <button
                  className='inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-150'
                  onClick={() => setShowUser(true)}
                  aria-label={`Ver detalhes de ${user.nome_guerra}`}
                  title='Ver detalhes'
               >
                  <IoMdInformationCircleOutline size={20} />
               </button>
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
