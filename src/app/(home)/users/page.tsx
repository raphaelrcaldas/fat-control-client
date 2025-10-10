"use client";

import { Spinner, TextInput, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import useDebouncedValue from "./hooks/useDebouncedValue";
import useUsers from "./hooks/useUsers";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./components/UserDetailsModal";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useToast } from "../../context/toast";
import { UserCreateModal } from "./components/userForm";

export default function UsersPage() {
   const { push } = useToast();
   const { usuarios, updateListUsers, loading } = useUsers();

   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 220);
   const [showCreateModal, setShowCreateModal] = useState(false);

   useEffect(() => {
      const ac = new AbortController();
      updateListUsers(ac.signal, (msg: string) =>
         push({ message: msg, type: "error" })
      );
      return () => ac.abort();
   }, []);

   const filteredUsers = ((): UserPublic[] => {
      const input = debouncedFilter.trim().toLowerCase();
      if (!input) return usuarios;
      return usuarios.filter((user) => {
         const nomeCompleto = (user.nome_completo || "").toLowerCase();
         const nomeGuerra = (user.nome_guerra || "").toLowerCase();

         return nomeCompleto.includes(input) || nomeGuerra.includes(input);
      });
   })();

   return (
      <div className='w-full h-full px-1 py-2 overflow-auto'>
         <div className='grid bg-white p-3 rounded-lg shadow-md gap-3 mb-5'>
            <h5 className='font-semibold text-lg'>Usuários</h5>
            <div className='flex flex-row justify-between gap-3'>
               <TextInput
                  className='w-full lg:w-2/3'
                  placeholder='Buscar usuário por nome de guerra ou nome completo...'
                  value={filterName}
                  onChange={(e) => setFilterName((e as any).target.value)}
               />
               <Button
                  color='blue'
                  onClick={() => setShowCreateModal(true)}
                  className='whitespace-nowrap'
               >
                  Adicionar
               </Button>
            </div>
         </div>

         {loading ? (
            <div className='flex justify-center items-center h-40'>
               <Spinner size='xl' />
            </div>
         ) : (
            <>
               <div className='w-full shadow-md rounded-lg bg-white'>
                  <table className='w-full text-sm text-gray-600 text-left'>
                     <thead className='text-xs text-gray-600 bg-gray-50'>
                        <tr>
                           <th scope='col' className='px-4 py-3 text-nowrap'>
                              P/G
                           </th>
                           <th
                              scope='col'
                              className='px-4 py-3 hidden md:table-cell'
                           >
                              Especialidade
                           </th>
                           <th scope='col' className='px-4 py-3'>
                              Nome de Guerra
                           </th>
                           <th
                              scope='col'
                              className='px-4 py-3 hidden md:table-cell'
                           >
                              Nome Completo
                           </th>
                           <th scope='col' className='px-4 py-3 text-center'>
                              Unidade
                           </th>
                           <th scope='col' className='px-4 py-3'>
                              <span className='sr-only'>Detalhes</span>
                           </th>
                        </tr>
                     </thead>
                     <tbody className='uppercase'>
                        {filteredUsers.map((user) => (
                           <UserRow
                              key={user.id}
                              user={user}
                              update={updateListUsers}
                           />
                        ))}
                     </tbody>
                  </table>
               </div>
            </>
         )}
         <UserCreateModal
            show={showCreateModal}
            setShow={setShowCreateModal}
            updateUsers={updateListUsers}
         />
      </div>
   );
}

function UserRow({ user, update }) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <tr className='border-b last:border-b-0 hover:bg-gray-50 transition-colors'>
            <td className='px-4 py-3 font-medium text-gray-900'>
               {user.posto.short}
            </td>
            <td className='px-4 py-3 hidden md:table-cell'>{user.esp}</td>
            <td className='px-4 py-3'>{user.nome_guerra}</td>
            <td className='px-4 py-3 hidden md:table-cell'>
               {user.nome_completo}
            </td>
            <td className='px-4 py-3 font-semibold text-center'>
               {user.unidade}
            </td>
            <td className='px-4 py-3 text-right'>
               <button
                  className='inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition'
                  onClick={() => setShowUser(true)}
                  aria-label={`Detalhes ${user.nome_guerra}`}
               >
                  <IoMdInformationCircleOutline size={18} />
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
