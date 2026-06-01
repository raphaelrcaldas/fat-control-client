import { memo } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
   Button,
   Tooltip,
} from "flowbite-react";
import {
   FaUsers,
   FaPlus,
   FaMagnifyingGlass,
   FaArrowRightToBracket,
   FaRegTrashCan,
   FaUserPen,
} from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import type { UserWithRole } from "../../config/types";
import { getRoleTheme } from "../../config/roleThemes";

interface UsersTableProps {
   filteredUsers: UserWithRole[];
   filterName: string;
   isUpdating: boolean;
   onFilterChange: (value: string) => void;
   onRefresh: () => void;
   onAddUser: () => void;
   onEditRole: (ur: UserWithRole) => void;
   onDevLogin: (userId: number) => void;
   onDeleteRole: (
      userId: number,
      organizacaoId: string | null,
      roleId: number,
      userName: string
   ) => void;
}

export const UsersTable = memo(function UsersTable({
   filteredUsers,
   filterName,
   isUpdating,
   onFilterChange,
   onRefresh,
   onAddUser,
   onEditRole,
   onDevLogin,
   onDeleteRole,
}: UsersTableProps) {
   return (
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
         <div className="border-b border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
               <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FaUsers />
                  Usuários com Perfis
               </h3>
               <div className="flex gap-2">
                  <Tooltip content="Atualizar lista">
                     <Button
                        size="sm"
                        color="light"
                        onClick={onRefresh}
                        disabled={isUpdating}
                     >
                        <HiRefresh
                           className={isUpdating ? "animate-spin" : ""}
                        />
                     </Button>
                  </Tooltip>
                  <Button size="sm" color="red" onClick={onAddUser}>
                     <FaPlus className="mr-2" />
                     Adicionar
                  </Button>
               </div>
            </div>

            <TextInput
               icon={FaMagnifyingGlass}
               className="w-full"
               value={filterName}
               onChange={(e) => onFilterChange(e.target.value)}
               placeholder="Buscar por nome, posto ou perfil..."
            />
         </div>

         <div className="overflow-x-auto">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Ações
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={3} className="py-12 text-center">
                           <div className="flex flex-col items-center gap-2">
                              <FaUsers className="text-5xl text-gray-300" />
                              <p className="font-medium text-gray-600">
                                 {filterName
                                    ? "Nenhum usuário encontrado"
                                    : "Nenhum usuário cadastrado"}
                              </p>
                              {filterName && (
                                 <button
                                    onClick={() => onFilterChange("")}
                                    className="text-sm text-blue-600 hover:underline"
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
                              key={`${ur.user.id}-${ur.organizacao_id ?? "sys"}`}
                              className="bg-white hover:bg-gray-50"
                           >
                              <TableCell className="font-medium">
                                 <div className="flex items-center gap-3">
                                    <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white uppercase shadow sm:flex">
                                       {ur.user.p_g}
                                    </div>
                                    <span className="uppercase">
                                       {ur.user.nome_guerra}
                                    </span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 {(() => {
                                    const colors = getRoleTheme(ur.role.name);
                                    return (
                                       <span
                                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium uppercase ${colors.bg} ${colors.text}`}
                                       >
                                          {ur.role.name}
                                       </span>
                                    );
                                 })()}
                              </TableCell>
                              <TableCell>
                                 <div className="flex justify-center gap-2">
                                    <Tooltip content="Editar perfil">
                                       <button
                                          onClick={() => onEditRole(ur)}
                                          disabled={isUpdating}
                                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                       >
                                          <FaUserPen className="size-4" />
                                       </button>
                                    </Tooltip>
                                    <Tooltip content="Login como usuário">
                                       <button
                                          onClick={() => onDevLogin(ur.user.id)}
                                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-100"
                                       >
                                          <FaArrowRightToBracket className="size-4" />
                                       </button>
                                    </Tooltip>
                                    <Tooltip content="Remover perfil">
                                       <button
                                          onClick={() =>
                                             onDeleteRole(
                                                ur.user.id,
                                                ur.organizacao_id,
                                                ur.role.id,
                                                userName
                                             )
                                          }
                                          className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                                       >
                                          <FaRegTrashCan className="size-4" />
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
