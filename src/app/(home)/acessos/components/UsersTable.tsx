import { memo } from "react";
import clsx from "clsx";
import {
   Badge,
   Button,
   Select,
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
   FaUserSlash,
   FaUsers,
} from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import type { UserWithRole } from "services/routes/security/roles";
import type { Tenant } from "services/routes/tenants";
import { useAbaixoDe } from "@/hooks/useAbaixoDe";
import { normalizeOrgTheme } from "@/lib/orgTheme";
import type { RoleFilterOption } from "../hooks/useUserRoleFilter";
import { RoleBadge } from "./RoleBadge";
import { ScopeBadge } from "./ScopeBadge";

interface UsersTableProps {
   filteredUsers: UserWithRole[];
   filterName: string;
   /** Perfil filtrado (id) e as opções presentes na lista, com contagem */
   roleFilter: number | null;
   roleOptions: RoleFilterOption[];
   currentUserId: number | null;
   isUpdating: boolean;
   /** Catálogo de perfis indisponível: o modal de edição abriria sem opções */
   editDisabled?: boolean;
   tenants: Tenant[];
   /** "Logar como" é utilitário de dev — só aparece fora de produção. */
   showDevLogin: boolean;
   onFilterChange: (value: string) => void;
   onRoleFilterChange: (value: number | null) => void;
   /** Limpa busca e perfil de uma vez */
   onClearFilters: () => void;
   onRefresh: () => void;
   onEditRole: (ur: UserWithRole) => void;
   onDevLogin: (userId: number) => void;
   onDeleteRole: (ur: UserWithRole) => void;
}

/** A seta do select é background a 12px da direita: o `p-2.5` do tamanho md
 *  apaga o `pr-10` da base (twMerge), então o padding direito volta aqui. */
export const SELECT_THEME = {
   field: { select: { sizes: { md: "py-2.5 pl-2.5 pr-7 text-sm" } } },
};

export const UsersTable = memo(function UsersTable({
   filteredUsers,
   filterName,
   roleFilter,
   roleOptions,
   currentUserId,
   isUpdating,
   editDisabled = false,
   tenants,
   showDevLogin,
   onFilterChange,
   onRoleFilterChange,
   onClearFilters,
   onRefresh,
   onEditRole,
   onDevLogin,
   onDeleteRole,
}: UsersTableProps) {
   const mobile = useAbaixoDe("sm");
   const tenantById = new Map(tenants.map((t) => [t.organizacao_id, t]));
   const hasFilter = filterName.trim() !== "" || roleFilter !== null;

   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {/* Toolbar: busca + perfil + atualizar. Uma linha só no mobile: a busca
             cede (flex-1 min-w-0), o select tem largura fixa e estreita (o
             texto da opção trunca no select nativo) e o botão não encolhe */}
         <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4">
            <TextInput
               icon={FaMagnifyingGlass}
               className="min-w-0 flex-1"
               value={filterName}
               onChange={(e) => onFilterChange(e.target.value)}
               aria-label="Buscar por nome, posto ou perfil"
               placeholder={
                  mobile ? "Buscar…" : "Buscar por nome, posto ou perfil..."
               }
            />
            <Select
               className="w-[112px] shrink-0 sm:w-[200px]"
               aria-label="Filtrar por perfil"
               theme={SELECT_THEME}
               value={roleFilter ?? ""}
               onChange={(e) =>
                  onRoleFilterChange(
                     e.target.value ? Number(e.target.value) : null
                  )
               }
            >
               <option value="">Todos</option>
               {roleOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                     {o.name.toUpperCase()} ({o.count})
                  </option>
               ))}
            </Select>
            <Tooltip content="Atualizar lista">
               <Button
                  className="shrink-0 px-3 sm:px-5"
                  color="light"
                  onClick={onRefresh}
                  disabled={isUpdating}
                  aria-label="Atualizar lista"
               >
                  <HiRefresh className={isUpdating ? "animate-spin" : ""} />
               </Button>
            </Tooltip>
         </div>

         <div className="overflow-x-auto">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="px-2 sm:px-6">
                        Usuário
                     </TableHeadCell>
                     <TableHeadCell className="px-2 sm:px-6">
                        Perfil
                     </TableHeadCell>
                     <TableHeadCell className="hidden px-6 sm:table-cell">
                        Escopo
                     </TableHeadCell>
                     <TableHeadCell className="px-2 text-center sm:px-6">
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
                                 {hasFilter
                                    ? "Nenhum vínculo encontrado"
                                    : "Nenhum vínculo cadastrado"}
                              </p>
                              {hasFilter && (
                                 <Button
                                    size="xs"
                                    color="light"
                                    onClick={onClearFilters}
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
                        const tenant = ur.organizacao_id
                           ? tenantById.get(ur.organizacao_id)
                           : undefined;
                        return (
                           <TableRow
                              key={`${ur.user.id}-${ur.organizacao_id ?? "sys"}`}
                              className="bg-white hover:bg-gray-50"
                           >
                              <TableCell className="px-2 font-medium sm:px-6">
                                 <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                    <div className="bg-primary-600 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white uppercase shadow sm:size-10">
                                       {ur.user.p_g}
                                    </div>
                                    <span
                                       className={clsx(
                                          "min-w-0 truncate text-gray-900 uppercase sm:max-w-none",
                                          // Inativo: o ícone (12px) + o gap (7px)
                                          // saem do orçamento do nome, para a
                                          // coluna não passar da largura atual
                                          ur.user.active
                                             ? "max-w-[80px]"
                                             : "max-w-[60px]"
                                       )}
                                       title={ur.user.nome_guerra}
                                    >
                                       {ur.user.nome_guerra}
                                    </span>
                                    {!ur.user.active && (
                                       <>
                                          {/* Mobile: só o ícone; o texto vai
                                              para o leitor de tela */}
                                          <span
                                             className="inline-flex shrink-0 sm:hidden"
                                             title="Usuário inativo"
                                          >
                                             <FaUserSlash
                                                aria-hidden
                                                className="size-3.5 text-amber-600"
                                             />
                                             <span className="sr-only">
                                                (inativo)
                                             </span>
                                          </span>
                                          <Badge
                                             color="warning"
                                             className="hidden shrink-0 sm:inline-flex"
                                          >
                                             Inativo
                                          </Badge>
                                       </>
                                    )}
                                 </div>
                              </TableCell>
                              <TableCell className="px-2 sm:px-6">
                                 <RoleBadge roleName={ur.role.name} />
                              </TableCell>
                              <TableCell className="hidden px-6 sm:table-cell">
                                 <ScopeBadge
                                    sigla={
                                       ur.organizacao_id
                                          ? (tenant?.organizacao.sigla ??
                                            ur.organizacao_id)
                                          : null
                                    }
                                    tema={
                                       tenant
                                          ? normalizeOrgTheme(tenant.tema)
                                          : undefined
                                    }
                                 />
                              </TableCell>
                              <TableCell className="px-2 sm:px-6">
                                 <div className="flex justify-center gap-1 sm:gap-2">
                                    <Tooltip
                                       content={
                                          isSelf
                                             ? "Você não pode alterar o próprio perfil"
                                             : "Editar perfil"
                                       }
                                    >
                                       <Button
                                          size="xs"
                                          className="px-2 sm:px-3"
                                          color="light"
                                          onClick={() => onEditRole(ur)}
                                          disabled={
                                             isUpdating ||
                                             editDisabled ||
                                             isSelf
                                          }
                                          aria-label={
                                             isSelf
                                                ? "Você não pode alterar o próprio perfil"
                                                : `Editar perfil de ${userName}`
                                          }
                                       >
                                          <FaUserPen className="size-4 text-gray-600" />
                                       </Button>
                                    </Tooltip>
                                    {showDevLogin && (
                                       <Tooltip content="Login como usuário (dev)">
                                          <Button
                                             size="xs"
                                             className="px-2 sm:px-3"
                                             color="light"
                                             onClick={() =>
                                                onDevLogin(ur.user.id)
                                             }
                                             aria-label={`Login como ${userName} (dev)`}
                                          >
                                             <FaArrowRightToBracket className="size-4 text-blue-600" />
                                          </Button>
                                       </Tooltip>
                                    )}
                                    <Tooltip
                                       content={
                                          isSelf
                                             ? "Você não pode remover o próprio acesso"
                                             : "Remover perfil"
                                       }
                                    >
                                       <Button
                                          size="xs"
                                          className="px-2 sm:px-3"
                                          color="light"
                                          disabled={isSelf}
                                          onClick={() => onDeleteRole(ur)}
                                          aria-label={
                                             isSelf
                                                ? "Você não pode remover o próprio acesso"
                                                : `Remover perfil de ${userName}`
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
