"use client";

import { useState, useEffect } from "react";
import {
   getUsersRoles,
   getRoles,
   updateUserRole,
   deleteUserRole,
} from "services/routes/security/roles";
import { UserWithRole, Role } from "services/routes/security/roles";
import { useToast } from "@/app/context/toast";
import { FaRegTrashCan } from "react-icons/fa6";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Select,
   TextInput,
   Button,
} from "flowbite-react";
import UserAddRole from "./components/userAddRole";
import useDebouncedValue from "../../users/hooks/useDebouncedValue";

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<Role[]>([]);
   const [showAddModal, setShowAddModal] = useState(false);

   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 220);

   const filteredUsers = ((): UserWithRole[] => {
      const input = debouncedFilter.trim().toLowerCase();
      if (!input) return userRoles;

      return userRoles.filter((ur) => {
         const nomeGuerra = (ur.user.nome_guerra || "").toLowerCase();

         return nomeGuerra.includes(input);
      });
   })();

   const { push } = useToast();

   function updateUserRoles() {
      setUserRoles(null);
      getUsersRoles().then((data) => {
         data.sort((a, b) => {
            const antA = a.user.posto.ant;
            const antB = b.user.posto.ant;
            if (antA !== antB) return antA - antB;

            const promoA = a.user.ult_promo || "";
            const promoB = b.user.ult_promo || "";
            if (promoA !== promoB) return promoA.localeCompare(promoB);

            return (a.user.ant_rel ?? 0) - (b.user.ant_rel ?? 0);
         });
         setUserRoles(data);
      });
   }

   async function pathUserRole(userId, roleId) {
      const res = await updateUserRole(roleId, userId);
      const data = await res.json();
      if (res.ok) {
         push({ type: "success", message: data.detail });
      } else {
         push({ type: "error", message: data.detail });
      }
      updateUserRoles();
   }

   async function delUserRole(userId, roleId) {
      const confirmDel = window.confirm(
         "Deseja deletar o perfil deste Usuário ?"
      );

      if (confirmDel) {
         const res = await deleteUserRole(roleId, userId);
         const data = await res.json();
         if (res.ok) {
            push({ type: "success", message: data.detail });
         } else {
            push({ type: "error", message: data.detail });
         }
         updateUserRoles();
      }
   }

   useEffect(() => {
      updateUserRoles();
      getRoles().then((data) => setRoles(data));
   }, []);

   if (!userRoles) return "Loading...";

   return (
      <>
         <UserAddRole
            show={showAddModal}
            setShow={setShowAddModal}
            update={() => updateUserRoles()}
            usersIgnr={userRoles.map((u) => u.user.id)}
            roles={roles}
         />
         <div className='p-2 grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-3 w-fit bg-white p-2 px-3 rounded-md'>
               <h3 className='text-center'>Perfis de Usuários</h3>

               <div className='flex flex-row justify-between'>
                  <TextInput
                     value={filterName}
                     onChange={(e) => setFilterName(e.target.value)}
                     placeholder='Buscar por nome de guerra'
                  />
                  <Button onClick={() => setShowAddModal(true)}>
                     Adicionar
                  </Button>
               </div>
               <div className='shadow'>
                  <Table hoverable>
                     <TableHead>
                        <TableHeadCell>Usuário</TableHeadCell>
                        <TableHeadCell>Perfil</TableHeadCell>
                        <TableHeadCell>Action</TableHeadCell>
                     </TableHead>
                     <TableBody className='divide-y'>
                        {filteredUsers.map((ur) => {
                           return (
                              <TableRow
                                 key={ur.user.id}
                                 className='bg-white uppercase'
                              >
                                 <TableCell className='whitespace-nowrap font-medium text-gray-900 '>
                                    {`${ur.user.p_g} ${ur.user.nome_guerra}`}
                                 </TableCell>
                                 <TableCell className=''>
                                    <Select
                                       onChange={(e) =>
                                          pathUserRole(
                                             ur.user.id,
                                             e.target.value
                                          )
                                       }
                                       value={ur.role.id}
                                    >
                                       {roles.map((r) => (
                                          <option key={r.id} value={r.id}>
                                             {r.name.toUpperCase()}
                                          </option>
                                       ))}
                                    </Select>
                                 </TableCell>
                                 <TableCell className='grid place-items-center justify-center'>
                                    <span
                                       className='p-3 text-red-500 cursor-pointer'
                                       onClick={() =>
                                          delUserRole(ur.user.id, ur.role.id)
                                       }
                                    >
                                       <FaRegTrashCan className='text-xl' />
                                    </span>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               </div>
            </div>

            <Table className='w-fit' hoverable>
               <TableHead>
                  <TableHeadCell>ID</TableHeadCell>
                  <TableHeadCell>Perfil</TableHeadCell>
                  <TableHeadCell>Descrição</TableHeadCell>
               </TableHead>
               <TableBody className='divide-y'>
                  {roles.map((r) => {
                     return (
                        <TableRow key={r.id} className='bg-white uppercase'>
                           <TableCell>{r.id}</TableCell>
                           <TableCell className='whitespace-nowrap font-medium text-gray-900 '>
                              {r.name}
                           </TableCell>
                           <TableCell>{r.description}</TableCell>
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
         </div>
      </>
   );
}
