"use client";

import { TextInput, Button, Badge } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState, useEffect, useCallback } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { getUsers, UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./components/UserDetailsModal";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
   HiSearch,
   HiUserAdd,
   HiUsers,
   HiCheckCircle,
   HiXCircle,
} from "react-icons/hi";
import { useToast } from "../../context/toast";
import { UserCreateModal } from "./components/userForm";

export default function UsersPage() {
   const { push } = useToast();
   const [filterName, setFilterName] = useState("");
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [usuarios, setUsuarios] = useState<UserPublic[]>([]);
   const [loading, setLoading] = useState(false);
   const debouncedFilter = useDebouncedValue(filterName, 220);

   const updateListUsers = useCallback(
      async (signal?: AbortSignal, onError?: (msg: string) => void) => {
         setLoading(true);
         try {
            const users = await getUsers(undefined, signal);
            setUsuarios(users);
         } catch (err: any) {
            const message =
               err?.message || String(err) || "Erro ao buscar usuários";
            if (onError) onError(message);
         } finally {
            setLoading(false);
         }
      },
      []
   );

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
         {/* Header com busca e contador */}
         <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
               <div className='flex items-center gap-3'>
                  <div className='p-2 bg-red-100 rounded-lg'>
                     <HiUsers className='w-6 h-6 text-red-600' />
                  </div>
                  <div>
                     <h5 className='font-semibold text-lg text-gray-900'>
                        Usuários
                     </h5>
                     {!loading && (
                        <p className='text-sm text-gray-500'>
                           {filteredUsers.length}{" "}
                           {filteredUsers.length === 1
                              ? "usuário encontrado"
                              : "usuários encontrados"}
                           {debouncedFilter && ` para "${debouncedFilter}"`}
                        </p>
                     )}
                  </div>
               </div>
               <Button
                  color='red'
                  onClick={() => setShowCreateModal(true)}
                  className='whitespace-nowrap'
               >
                  <HiUserAdd className='w-5 h-5 mr-2' />
                  Novo Usuário
               </Button>
            </div>

            {/* Barra de busca aprimorada */}
            <div className='relative'>
               <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <HiSearch className='w-5 h-5 text-gray-400' />
               </div>
               <TextInput
                  className='w-full'
                  placeholder='Buscar por nome de guerra ou nome completo...'
                  value={filterName}
                  onChange={(e) => setFilterName((e as any).target.value)}
                  style={{ paddingLeft: "2.5rem" }}
               />
            </div>
         </div>

         {loading ? (
            <div className='flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200'>
               <Spinner size='xl' />
               <p className='mt-4 text-gray-500'>Carregando usuários...</p>
            </div>
         ) : filteredUsers.length === 0 ? (
            <div className='flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200'>
               <div className='p-4 bg-gray-100 rounded-full mb-4'>
                  <HiUsers className='w-12 h-12 text-gray-400' />
               </div>
               <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  {debouncedFilter
                     ? "Nenhum usuário encontrado"
                     : "Nenhum usuário cadastrado"}
               </h3>
               <p className='text-gray-500 text-center max-w-md mb-4'>
                  {debouncedFilter
                     ? `Não encontramos resultados para "${debouncedFilter}". Tente outro termo de busca.`
                     : "Comece adicionando o primeiro usuário ao sistema."}
               </p>
               {!debouncedFilter && (
                  <Button color='red' onClick={() => setShowCreateModal(true)}>
                     <HiUserAdd className='w-5 h-5 mr-2' />
                     Adicionar Primeiro Usuário
                  </Button>
               )}
            </div>
         ) : (
            <>
               {/* Tabela Desktop */}
               <div className='hidden md:block w-full shadow-sm rounded-lg bg-white border border-gray-200 overflow-hidden'>
                  <table className='w-full text-sm text-gray-600 text-left'>
                     <thead className='text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200'>
                        <tr>
                           <th scope='col' className='px-4 py-3 font-semibold'>
                              #
                           </th>
                           <th
                              scope='col'
                              className='px-4 py-3 font-semibold text-nowrap'
                           >
                              P/G
                           </th>
                           <th scope='col' className='px-4 py-3 font-semibold'>
                              Especialidade
                           </th>
                           <th scope='col' className='px-4 py-3 font-semibold'>
                              Nome de Guerra
                           </th>
                           <th scope='col' className='px-4 py-3 font-semibold'>
                              Nome Completo
                           </th>
                           <th
                              scope='col'
                              className='px-4 py-3 font-semibold text-center'
                           >
                              Unidade
                           </th>
                           <th
                              scope='col'
                              className='px-4 py-3 font-semibold text-center'
                           >
                              Status
                           </th>
                           <th scope='col' className='px-4 py-3'>
                              <span className='sr-only'>Detalhes</span>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
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

               {/* Cards Mobile */}
               <div className='md:hidden space-y-3'>
                  {filteredUsers.map((user) => (
                     <UserCard
                        key={user.id}
                        user={user}
                        update={updateListUsers}
                     />
                  ))}
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

function UserCard({ user, update }) {
   const [showUser, setShowUser] = useState(false);

   return (
      <>
         <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-150'>
            <div className='flex items-start justify-between mb-3'>
               <div className='flex items-center gap-2'>
                  <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                     <span className='text-red-600 font-bold text-sm uppercase'>
                        {user.p_g}
                     </span>
                  </div>
                  <div>
                     <h3 className='font-semibold text-gray-900 uppercase text-sm'>
                        {user.nome_guerra}
                     </h3>
                     <p className='text-xs text-gray-500 capitalize'>
                        {user.nome_completo}
                     </p>
                  </div>
               </div>
               <button
                  className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  onClick={() => setShowUser(true)}
                  aria-label={`Ver detalhes de ${user.nome_guerra}`}
               >
                  <IoMdInformationCircleOutline size={22} />
               </button>
            </div>

            <div className='grid grid-cols-4 gap-2 pt-3 border-t border-gray-100'>
               <div>
                  <p className='text-xs text-gray-500 mb-1'>Posto/Graduação</p>
                  <Badge color='gray' className='capitalize text-xs'>
                     {user.posto.long}
                  </Badge>
               </div>
               <div>
                  <p className='text-xs text-gray-500 mb-1'>Especialidade</p>
                  <Badge color='gray' className='uppercase text-xs '>
                     {user.esp}
                  </Badge>
               </div>
               <div>
                  <p className='text-xs text-gray-500 mb-1'>Unidade</p>
                  <Badge color='red' className='uppercase text-xs'>
                     {user.unidade}
                  </Badge>
               </div>
               <div>
                  <p className='text-xs text-gray-500 mb-1'>Status</p>
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
