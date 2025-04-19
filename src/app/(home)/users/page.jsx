"use client";

import { Table, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { getUsers } from "@/services/routes/users";
import { getPostos } from "@/services/routes/postos";
import { UserRegister } from "./components/userForm";
import { BadgeUAE } from "../components/badges";

const themeTable = {
   root: {
      base: "w-full text-base text-gray-500 uppercase text-center",
      shadow:
         "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md",
      wrapper: "relative",
   },
   body: {
      base: "group/body",
      cell: {
         base: "px-3 py-1 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
      },
   },
   head: {
      base: "group/head text-xs text-gray-700 dark:text-gray-400",
      cell: {
         base: "bg-gray-100 px-1 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
      },
   },
   row: {
      base: "group/row bg-white hover:font-semibold",
      hovered: "hover:bg-gray-50",
      striped: "odd:bg-white even:bg-gray-50",
   },
};

function useUsers() {
   const [usuarios, setUsuarios] = useState([]);

   const updateListUsers = () => {
      getUsers()
         .then((res) => res.json())
         .then((users) => {
            const sortedUltPromo = users.sort(
               (a, b) => new Date(a.ult_promo) - new Date(b.ult_promo)
            );
            const sortedAnt = sortedUltPromo.sort(
               (a, b) => a.posto.ant - b.posto.ant
            );
            setUsuarios(sortedAnt);
         });
   };

   return { usuarios, updateListUsers };
}

function useFilterUsers(usuarios, filterName) {
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
   const [postos, setPostos] = useState([]);

   useEffect(() => {
      if (postos.length == 0) {
         getPostos()
            .then((res) => res.json())
            .then((data) => {
               setPostos(data);
            });
      }
      updateListUsers();
   }, []);

   return (
      <>
         <h2 className='mb-4'>Usuários</h2>
         <div className='w-fit h-full'>
            <div className='flex flex-col md:flex-row justify-between gap-2 my-4'>
               <TextInput
                  className='w-full md:w-1/2'
                  placeholder='Search for User'
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
               />
               <div className='flex justify-center'>
                  <UserRegister
                     user_id={null}
                     updateUsers={updateListUsers}
                     postos={postos}
                  />
               </div>
            </div>

            <div className='relative w-fit overflow-x-auto overflow-y-auto shadow-md rounded-lg max-h-[75%]'>
               <Table hoverable theme={themeTable}>
                  <Table.Head className='text-sm'>
                     <Table.HeadCell className='text-center'>
                        P/G
                     </Table.HeadCell>
                     <Table.HeadCell className='text-center hidden md:table-cell'>
                        Especialidade
                     </Table.HeadCell>
                     <Table.HeadCell>Nome de Guerra</Table.HeadCell>
                     <Table.HeadCell className='hidden md:table-cell'>
                        Nome Completo
                     </Table.HeadCell>
                     <Table.HeadCell className='text-center'>
                        Unidade
                     </Table.HeadCell>
                     <Table.HeadCell>
                        <span className='sr-only'>Detalhes</span>
                     </Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                     {filterUsers.map((user) => (
                        <Table.Row key={user.id}>
                           <Table.Cell className='font-medium text-gray-900'>
                              {user.posto.mid}
                           </Table.Cell>
                           <Table.Cell className='hidden md:table-cell'>
                              {user.esp}
                           </Table.Cell>
                           <Table.Cell>{user.nome_guerra}</Table.Cell>
                           <Table.Cell className='text-left hidden md:table-cell'>
                              {user.nome_completo}
                           </Table.Cell>
                           <Table.Cell className='grid py-4 justify-items-center'>
                              <BadgeUAE>{user.unidade}</BadgeUAE>
                           </Table.Cell>
                           <Table.Cell>
                              <UserRegister
                                 readOnly={false}
                                 user_id={user.id}
                                 updateUsers={updateListUsers}
                                 postos={postos}
                              />
                           </Table.Cell>
                        </Table.Row>
                     ))}
                  </Table.Body>
               </Table>
            </div>
         </div>
      </>
   );
}
