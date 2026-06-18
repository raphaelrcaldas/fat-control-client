import { memo } from "react";
import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
   Tooltip,
} from "flowbite-react";
import {
   FaArrowRightToBracket,
   FaMagnifyingGlass,
   FaRegTrashCan,
   FaUserPen,
   FaUsers,
} from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import type { UserWithRole } from "services/routes/security/roles";
import { RoleBadge } from "./RoleBadge";
import { ScopeBadge } from "./ScopeBadge";

interface UsersTableProps {
   filteredUsers: UserWithRole[];
   filterName: string;
   currentUserId: number | null;
   isUpdating: boolean;
   onFilterChange: (value: string) => void;
   onRefresh: () => void;
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
   currentUserId,
   isUpdating,
   onFilterChange,
   onRefresh,
   onEditRole,
   onDevLogin,
   onDeleteRole,
}: UsersTableProps) {
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {/* Toolbar: busca + atualizar */}
         <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4">
            <TextInput
               icon={FaMagnifyingGlass}
               className="flex-1"
               value={filterName}
               onChange={(e) => onFilterChange(e.target.value)}
               placeholder="Buscar por nome, posto ou perfil..."
            />
            <Tooltip content="Atualizar lista">
               <Button color="light" onClick={onRefresh} disabled={isUpdating}>
                  <HiRefresh className={isUpdating ? "animate-spin" : ""} />
               </Button>
            </Tooltip>
         </div>

         <div className="overflow-x-auto">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Usuário</TableHeadCell>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell>Escopo</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Ações
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-200">
                  {filteredUsers.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center">
                           <div className="flex flex-col items-center gap-2">
                              <FaUsers className="text-5xl text-gray-300" />
                              <p className="font-medium text-gray-600">
                                 {filterName
                                    ? "Nenhum usuário encontrado"
                                    : "Nenhum usuário cadastrado"}
                              </p>
                              {filterName && (
                                 <Button
                                    size="xs"
                                    color="light"
                                    onClick={() => onFilterChange("")}
                                 >
                                    Limpar filtro
                                 </Button>
                              )}
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : (
                     filteredUsers.map((ur) => {
                        const userName = `${ur.user.p_g} ${ur.user.nome_guerra}`;
                        const isSelf = ur.user.id === currentUserId;
                        return (
                           <TableRow
                              key={`${ur.user.id}-${ur.organizacao_id ?? "sys"}`}
                              className="bg-white hover:bg-gray-50"
                           >
                              <TableCell className="font-medium">
                                 <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white uppercase shadow">
                                       {ur.user.p_g}
                                    </div>
                                    <span className="text-gray-900 uppercase">
                                       {ur.user.nome_guerra}
                                    </span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <RoleBadge roleName={ur.role.name} />
                              </TableCell>
                              <TableCell>
                                 <ScopeBadge
                                    organizacaoId={ur.organizacao_id}
                                 />
                              </TableCell>
                              <TableCell>
                                 <div className="flex justify-center gap-2">
                                    <Tooltip content="Editar perfil">
                                       <Button
                                          size="xs"
                                          color="light"
                                          onClick={() => onEditRole(ur)}
                                          disabled={isUpdating}
                                       >
                                          <FaUserPen className="size-4 text-gray-600" />
                                       </Button>
                                    </Tooltip>
                                    <Tooltip content="Login como usuário">
                                       <Button
                                          size="xs"
                                          color="light"
                                          onClick={() => onDevLogin(ur.user.id)}
                                       >
                                          <FaArrowRightToBracket className="size-4 text-blue-600" />
                                       </Button>
                                    </Tooltip>
                                    <Tooltip
                                       content={
                                          isSelf
                                             ? "Você não pode remover o próprio acesso"
                                             : "Remover perfil"
                                       }
                                    >
                                       <Button
                                          size="xs"
                                          color="light"
                                          disabled={isSelf}
                                          onClick={() =>
                                             onDeleteRole(
                                                ur.user.id,
                                                ur.organizacao_id,
                                                ur.role.id,
                                                userName
                                             )
                                          }
                                       >
                                          <FaRegTrashCan className="size-4 text-red-600" />
                                       </Button>
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
