"use client";

import React from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { UserPublic } from "services/routes/users";

export default function UsersTable({
   users,
   onOpen,
}: {
   users: UserPublic[];
   onOpen: (id?: number) => void;
}) {
   return (
      <div className='relative w-full overflow-x-auto shadow-sm rounded-lg max-h-[80vh] bg-white border border-gray-100'>
         <table className='w-full text-sm text-gray-600 text-left overflow-visible'>
            <thead className='text-xs text-gray-600 bg-gray-50 sticky top-0 z-10'>
               <tr>
                  <th scope='col' className='px-4 py-3'>P/G</th>
                  <th scope='col' className='px-4 py-3 hidden md:table-cell'>Especialidade</th>
                  <th scope='col' className='px-4 py-3'>Nome de Guerra</th>
                  <th scope='col' className='px-4 py-3 hidden md:table-cell'>Nome Completo</th>
                  <th scope='col' className='px-4 py-3'>Unidade</th>
                  <th scope='col' className='px-4 py-3'><span className='sr-only'>Detalhes</span></th>
               </tr>
            </thead>
            <tbody className="uppercase">
               {users.map((user) => (
                  <tr key={user.id} className='border-b last:border-b-0 hover:bg-gray-50 transition-colors'>
                    <td className='px-4 py-3 font-medium text-gray-900'>{user.posto.short}</td>
                    <td className='px-4 py-3 hidden md:table-cell'>{user.esp}</td>
                    <td className='px-4 py-3'>{user.nome_guerra}</td>
                    <td className='px-4 py-3 hidden md:table-cell'>{user.nome_completo}</td>
                    <td className='px-4 py-3 font-semibold'>{user.unidade}</td>
                    <td className='px-4 py-3 text-right'>
                      <button
                        className='inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition'
                        onClick={() => onOpen(user.id)}
                        aria-label={`Detalhes ${user.nome_guerra}`}
                      >
                        <IoMdInformationCircleOutline size={18} />
                      </button>
                    </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
