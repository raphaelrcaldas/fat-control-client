"use client";

import { TextInput, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import { getUsers, UserPublic } from "../../../../services/routes/users";
import { UserRegister } from "./components/userForm";
import { IoMdInformationCircleOutline } from "react-icons/io";

function useUsers() {
   const [usuarios, setUsuarios] = useState([]);

   const updateListUsers = () => {
      getUsers().then((users) => {
         const sortedUltPromo = users.sort(
            (a, b) =>
               new Date(a.ult_promo).getTime() - new Date(b.ult_promo).getTime()
         );
         const sortedAnt = sortedUltPromo.sort(
            (a, b) => a.posto.ant - b.posto.ant
         );
         setUsuarios(sortedAnt);
      });
   };

   return { usuarios, updateListUsers };
}

function useFilterUsers(
   usuarios: UserPublic[],
   filterName: string
): {
   filterUsers: UserPublic[];
   setFilterUsers: React.Dispatch<React.SetStateAction<UserPublic[]>>;
} {
   const [filterUsers, setFilterUsers] = useState([]);

   useEffect(() => {
      const filtered = usuarios.filter((user) => {
         const inputFilter = filterName.toLowerCase();
         const nomeCompletoCheck = user.nome_completo
            .toLowerCase()
            .includes(inputFilter);
         const nomeGuerraCheck = user.nome_guerra
            .toLowerCase()
            .includes(inputFilter);

         return nomeCompletoCheck || nomeGuerraCheck;
      });
      setFilterUsers(filtered);
   }, [filterName, usuarios]);
   return { filterUsers, setFilterUsers };
}

export default function UsersPage() {
   const { usuarios, updateListUsers } = useUsers();
   const [filterName, setFilterName] = useState("");
   const { filterUsers } = useFilterUsers(usuarios, filterName);

   const [showUserModal, setShowUserModal] = useState(false);
   const [userId, setUserId] = useState(null);

   const handleUserForm = (userId?: number) => {
      setUserId(userId);
      setShowUserModal(true);
   };

   useEffect(() => {
      updateListUsers();
   }, []);

   return (
      <>
         <UserRegister
            userId={userId}
            updateUsers={updateListUsers}
            show={showUserModal}
            setShow={setShowUserModal}
         />
         <div className='w-full lg:w-2/3 h-full'>
            <div className='flex flex-row justify-between gap-2 my-4'>
               <TextInput
                  className='w-full md:w-1/2'
                  placeholder='Search for User'
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
               />
               <div className='flex justify-center'>
                  <Button color='blue' onClick={() => handleUserForm(null)}>
                     Adicionar Usuário
                  </Button>
               </div>
            </div>

            <div className='relative w-full overflow-x-auto overflow-y-auto shadow-lg rounded-lg max-h-[85%]'>
               <table className='w-full text-base text-gray-500 uppercase text-center overflow-visible'>
                  <thead className='text-xs text-gray-700 bg-gray-200 sticky top-0 z-10'>
                     <tr>
                        <th scope='col' className='px-3 py-3 text-center'>
                           P/G
                        </th>
                        <th
                           scope='col'
                           className='px-3 py-3 text-center hidden md:table-cell'
                        >
                           Especialidade
                        </th>
                        <th scope='col' className='px-3 py-3'>
                           Nome de Guerra
                        </th>
                        <th
                           scope='col'
                           className='px-3 py-3 hidden md:table-cell'
                        >
                           Nome Completo
                        </th>
                        <th scope='col' className='px-3 py-3 text-center'>
                           Unidade
                        </th>
                        <th scope='col'>
                           <span className='px-3 py-3 sr-only'>Detalhes</span>
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {filterUsers.map((user) => (
                        <tr
                           className='bg-white hover:bg-gray-50 hover:font-semibold'
                           key={user.id}
                        >
                           <td className='font-medium text-gray-900'>
                              {user.posto.short}
                           </td>
                           <td className='hidden md:table-cell'>{user.esp}</td>
                           <td>{user.nome_guerra}</td>
                           <td className='text-center hidden md:table-cell'>
                              {user.nome_completo}
                           </td>
                           <td className='grid py-4 justify-items-center font-semibold'>
                              {user.unidade}
                           </td>
                           <td className='px-1 py-2 align-middle text-center'>
                              <button
                                 className='py-2.5 px-5 text-lg font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100'
                                 onClick={() => handleUserForm(user.id)}
                              >
                                 <IoMdInformationCircleOutline />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </>
   );
}
