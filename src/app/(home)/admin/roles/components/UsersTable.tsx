import { memo } from "react";
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
   Tooltip,
} from "flowbite-react";
import { FaUsers, FaPlus, FaMagnifyingGlass, FaArrowRightToBracket, FaRegTrashCan } from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import type { UserWithRole, RoleDetail } from "./types";

interface UsersTableProps {
   filteredUsers: UserWithRole[];
   roles: RoleDetail[];
   filterName: string;
   isUpdating: boolean;
   onFilterChange: (value: string) => void;
   onRefresh: () => void;
   onAddUser: () => void;
   onRoleChange: (userId: number, roleId: string) => void;
   onDevLogin: (userId: number) => void;
   onDeleteRole: (userId: number, roleId: number, userName: string) => void;
}

export const UsersTable = memo(function UsersTable({
   filteredUsers,
   roles,
   filterName,
   isUpdating,
   onFilterChange,
   onRefresh,
   onAddUser,
   onRoleChange,
   onDevLogin,
   onDeleteRole,
}: UsersTableProps) {
   return (
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
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
                        onClick={onRefresh}
                        disabled={isUpdating}
                     >
                        <HiRefresh className={isUpdating ? "animate-spin" : ""} />
                     </Button>
                  </Tooltip>
                  <Button size='sm' color='blue' onClick={onAddUser}>
                     <FaPlus className='mr-2' />
                     Adicionar
                  </Button>
               </div>
            </div>

            <TextInput
               icon={FaMagnifyingGlass}
               className='w-full'
               value={filterName}
               onChange={(e) => onFilterChange(e.target.value)}
               placeholder='Buscar por nome, posto ou perfil...'
            />
         </div>

         <div className='overflow-x-auto'>
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell className='text-center'>Ações</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className='divide-y'>
                  {filteredUsers.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={3} className='py-12 text-center'>
                           <div className='flex flex-col items-center gap-2'>
                              <FaUsers className='text-5xl text-gray-300' />
                              <p className='text-gray-600 font-medium'>
                                 {filterName
                                    ? "Nenhum usuário encontrado"
                                    : "Nenhum usuário cadastrado"}
                              </p>
                              {filterName && (
                                 <button
                                    onClick={() => onFilterChange("")}
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
                              className='bg-white hover:bg-gray-50'
                           >
                              <TableCell className='font-medium'>
                                 <div className='flex items-center gap-3'>
                                    <div className='hidden w-10 h-10 rounded-full bg-blue-600 sm:flex items-center justify-center text-white font-bold text-sm shadow uppercase'>
                                       {ur.user.p_g}
                                    </div>
                                    <span className='uppercase'>{userName}</span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <Select
                                    onChange={(e) =>
                                       onRoleChange(ur.user.id, e.target.value)
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
                              <TableCell>
                                 <div className='flex justify-center gap-2'>
                                    <Tooltip content='Login como usuário'>
                                       <button
                                          onClick={() => onDevLogin(ur.user.id)}
                                          className='p-2 hover:bg-blue-100 text-blue-600 rounded-lg'
                                       >
                                          <FaArrowRightToBracket className='size-4' />
                                       </button>
                                    </Tooltip>
                                    <Tooltip content='Remover perfil'>
                                       <button
                                          onClick={() =>
                                             onDeleteRole(
                                                ur.user.id,
                                                ur.role.id,
                                                userName
                                             )
                                          }
                                          className='p-2 hover:bg-red-100 text-red-600 rounded-lg'
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
   );
});
