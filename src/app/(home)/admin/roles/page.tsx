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
import { FaRegTrashCan, FaUserShield, FaUsers, FaPlus } from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
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
   Badge,
   Spinner,
   Tooltip,
} from "flowbite-react";
import UserAddRole from "./components/userAddRole";
import useDebouncedValue from "../../users/hooks/useDebouncedValue";
import { FaSearch } from "react-icons/fa";

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<Role[]>([]);
   const [showAddModal, setShowAddModal] = useState(false);
   const [filterName, setFilterName] = useState("");
   const [isUpdating, setIsUpdating] = useState(false);
   const debouncedFilter = useDebouncedValue(filterName, 220);

   const filteredUsers = ((): UserWithRole[] => {
      const input = debouncedFilter.trim().toLowerCase();
      if (!input || !userRoles) return userRoles || [];

      return userRoles.filter((ur) => {
         const nomeGuerra = (ur.user.nome_guerra || "").toLowerCase();
         const pg = (ur.user.p_g || "").toLowerCase();
         const roleName = (ur.role.name || "").toLowerCase();

         return (
            nomeGuerra.includes(input) ||
            pg.includes(input) ||
            roleName.includes(input)
         );
      });
   })();

   const { push } = useToast();

   async function updateUserRoles() {
      setIsUpdating(true);
      try {
         const data = await getUsersRoles();
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
      } catch (error) {
         push({
            type: "error",
            message: "Erro ao carregar perfis de usuários",
         });
      } finally {
         setIsUpdating(false);
      }
   }

   async function pathUserRole(userId: number, roleId: string) {
      try {
         const res = await updateUserRole(roleId, userId);
         const data = await res.json();
         if (res.ok) {
            push({ type: "success", message: data.detail });
            updateUserRoles();
         } else {
            push({ type: "error", message: data.detail });
         }
      } catch (error) {
         push({ type: "error", message: "Erro ao atualizar perfil" });
      }
   }

   async function delUserRole(
      userId: number,
      roleId: number,
      userName: string
   ) {
      const confirmDel = window.confirm(
         `Tem certeza que deseja remover o perfil de ${userName.toUpperCase()}?`
      );

      if (confirmDel) {
         try {
            const res = await deleteUserRole(roleId, userId);
            const data = await res.json();
            if (res.ok) {
               push({ type: "success", message: data.detail });
               updateUserRoles();
            } else {
               push({ type: "error", message: data.detail });
            }
         } catch (error) {
            push({ type: "error", message: "Erro ao deletar perfil" });
         }
      }
   }

   useEffect(() => {
      updateUserRoles();
      getRoles().then((data) => setRoles(data));
   }, []);

   const getRoleBadgeColor = (roleName: string) => {
      const colors: Record<string, string> = {
         admin: "failure",
         moderator: "warning",
         user: "info",
         guest: "gray",
      };
      return colors[roleName.toLowerCase()] || "purple";
   };

   if (!userRoles) {
      return (
         <div className='flex items-center justify-center h-screen'>
            <div className='flex flex-col items-center gap-3'>
               <Spinner size='xl' />
               <span className='text-gray-600'>Carregando perfis...</span>
            </div>
         </div>
      );
   }

   return (
      <>
         <UserAddRole
            show={showAddModal}
            setShow={setShowAddModal}
            update={() => updateUserRoles()}
            usersIgnr={userRoles.map((u) => u.user.id)}
            roles={roles}
         />

         <div className='p-2 grid gap-4'>
            {/* Header */}
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg shadow-lg text-white'>
               <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <div>
                     <h1 className='text-2xl font-bold flex items-center gap-3'>
                        <FaUserShield className='text-2xl' />
                        Gerenciamento de Perfis
                     </h1>
                     <p className='text-blue-100 mt-2'>
                        Gerencie permissões e perfis de acesso dos usuários
                     </p>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-3'>
                     <Badge color='light' size='lg' className='w-fit'>
                        <FaUsers className='mr-2' />
                        {userRoles.length}{" "}
                        {userRoles.length === 1 ? "usuário" : "usuários"}
                     </Badge>
                     <Badge color='light' size='lg' className='w-fit'>
                        <FaUserShield className='mr-2' />
                        {roles.length}{" "}
                        {roles.length === 1 ? "perfil" : "perfis"}
                     </Badge>
                  </div>
               </div>
            </div>

            <div className='grid lg:grid-cols-3 gap-4'>
               {/* Tabela Principal de Usuários */}
               <div className='lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden'>
                  <div className='p-4 border-b bg-gray-50'>
                     <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3'>
                        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                           <FaUsers />
                           Usuários com Perfis
                        </h3>
                        <div className='flex gap-2'>
                           <Tooltip content='Atualizar lista'>
                              <Button
                                 size='sm'
                                 color='light'
                                 onClick={() => updateUserRoles()}
                                 disabled={isUpdating}
                              >
                                 <HiRefresh
                                    className={isUpdating ? "animate-spin" : ""}
                                 />
                              </Button>
                           </Tooltip>
                           <Button
                              size='sm'
                              color='blue'
                              onClick={() => setShowAddModal(true)}
                           >
                              <FaPlus className='mr-2' />
                              Adicionar
                           </Button>
                        </div>
                     </div>

                     <TextInput
                        icon={FaSearch}
                        className='w-full'
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder='Buscar por nome, posto ou perfil...'
                     />
                  </div>

                  <div className='overflow-x-auto'>
                     <Table hoverable>
                        <TableHead>
                           <TableRow>
                              <TableHeadCell>Usuário</TableHeadCell>
                              <TableHeadCell>Perfil</TableHeadCell>
                              <TableHeadCell className='text-center'>
                                 Ações
                              </TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className='divide-y'>
                           {filteredUsers.length === 0 ? (
                              <TableRow>
                                 <TableCell
                                    colSpan={3}
                                    className='py-12 text-center'
                                 >
                                    <div className='flex flex-col items-center gap-2'>
                                       <FaUsers className='text-5xl text-gray-300' />
                                       <p className='text-gray-600 font-medium'>
                                          {filterName
                                             ? "Nenhum usuário encontrado"
                                             : "Nenhum usuário cadastrado"}
                                       </p>
                                       {filterName && (
                                          <button
                                             onClick={() => setFilterName("")}
                                             className='text-blue-600 hover:underline text-sm'
                                          >
                                             Limpar filtro
                                          </button>
                                       )}
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ) : (
                              filteredUsers.map((ur) => {
                                 const userName = `${ur.user.p_g} ${ur.user.nome_guerra}`;
                                 return (
                                    <TableRow
                                       key={ur.user.id}
                                       className='bg-white hover:bg-gray-50 transition-colors'
                                    >
                                       <TableCell className='font-medium'>
                                          <div className='flex items-center gap-3'>
                                             <div className='hidden w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 sm:flex items-center justify-center text-white font-bold text-sm shadow uppercase'>
                                                {ur.user.p_g}
                                             </div>
                                             <span className='uppercase'>
                                                {userName}
                                             </span>
                                          </div>
                                       </TableCell>
                                       <TableCell>
                                          <Select
                                             onChange={(e) =>
                                                pathUserRole(
                                                   ur.user.id,
                                                   e.target.value
                                                )
                                             }
                                             value={ur.role.id}
                                             // sizing='sm'
                                          >
                                             {roles.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                   {r.name.toUpperCase()}
                                                </option>
                                             ))}
                                          </Select>
                                       </TableCell>
                                       <TableCell>
                                          <div className='flex justify-center'>
                                             <Tooltip content='Remover perfil'>
                                                <button
                                                   onClick={() =>
                                                      delUserRole(
                                                         ur.user.id,
                                                         ur.role.id,
                                                         userName
                                                      )
                                                   }
                                                   className='p-2 hover:bg-red-100 text-red-600 cursor-pointer rounded-lg transition-all hover:scale-110'
                                                >
                                                   <FaRegTrashCan className='size-4' />
                                                </button>
                                             </Tooltip>
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 );
                              })
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </div>

               {/* Tabela de Perfis Disponíveis */}
               <div className='bg-white rounded-lg shadow-md overflow-hidden h-fit'>
                  <div className='p-4 border-b bg-gray-50'>
                     <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                        <FaUserShield />
                        Perfis Disponíveis
                     </h3>
                  </div>
                  <div className='overflow-x-auto'>
                     <Table hoverable>
                        <TableHead>
                           <TableRow>
                              <TableHeadCell>Perfil</TableHeadCell>
                              <TableHeadCell>Descrição</TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className='divide-y'>
                           {roles.map((r) => {
                              return (
                                 <TableRow
                                    key={r.id}
                                    className='bg-white hover:bg-gray-50'
                                 >
                                    <TableCell>
                                       <Badge
                                          color={getRoleBadgeColor(r.name)}
                                          className='uppercase w-fit'
                                       >
                                          {r.name}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className='text-sm text-gray-600 uppercase'>
                                       {r.description || "Sem descrição"}
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
}
