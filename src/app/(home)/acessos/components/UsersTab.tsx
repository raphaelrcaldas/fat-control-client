import { memo, useCallback, useState } from "react";
import clsx from "clsx";
import { FaArrowRightToBracket } from "react-icons/fa6";
import type { UserWithRole, RoleDetail } from "services/routes/security/roles";
import type { Tenant } from "services/routes/tenants";
import { useToast } from "@/app/context/toast";
import { useAuth } from "@/app/context/auth";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useDeleteUserRole } from "@/hooks/queries/useRoles";
import { UsersTable } from "./UsersTable";
import UserEditRole from "./UserEditRole";
import type { DeletingUserRole, EditingRole } from "../helpers/types";
import { useDevLogin } from "../hooks/useDevLogin";
import type { RoleFilterOption } from "../hooks/useUserRoleFilter";
import { orgLabel } from "../helpers/tenantLabel";

interface UsersTabProps {
   roles: RoleDetail[];
   tenants: Tenant[];
   isFetching: boolean;
   /** Filtro de busca (estado no pai: o masthead mostra a contagem filtrada) */
   filterName: string;
   setFilterName: (value: string) => void;
   /** Filtro por perfil (id) e as opções presentes na lista, com contagem */
   roleFilter: number | null;
   setRoleFilter: (value: number | null) => void;
   roleOptions: RoleFilterOption[];
   onClearFilters: () => void;
   filteredUsers: UserWithRole[];
   /** Perfis indisponíveis (carregando ou falhou): trava a edição */
   editDisabled?: boolean;
   onRefresh: () => void;
}

export const UsersTab = memo(function UsersTab({
   roles,
   tenants,
   isFetching,
   filterName,
   setFilterName,
   roleFilter,
   setRoleFilter,
   roleOptions,
   onClearFilters,
   filteredUsers,
   editDisabled = false,
   onRefresh,
}: UsersTabProps) {
   const { push } = useToast();
   const { userId: currentUserId } = useAuth();

   const [showEditModal, setShowEditModal] = useState(false);
   const [editingRole, setEditingRole] = useState<EditingRole | null>(null);

   const deleteMutation = useDeleteUserRole();
   const [showDelModal, setShowDelModal] = useState(false);
   const [deletingUserRole, setDeletingUserRole] =
      useState<DeletingUserRole | null>(null);

   // "Logar como" é utilitário de dev (o endpoint só responde fora de prod);
   // esconde o botão e o modal em produção.
   const isDev = process.env.NODE_ENV !== "production";
   const devLogin = useDevLogin();

   const onEditRole = useCallback(
      (ur: UserWithRole) => {
         const label = orgLabel(ur.organizacao_id, tenants);

         setEditingRole({
            userId: ur.user.id,
            userLabel: `${ur.user.p_g} ${ur.user.nome_guerra}`,
            organizacaoId: ur.organizacao_id,
            orgLabel: label,
            currentRoleId: ur.role.id,
         });
         setShowEditModal(true);
      },
      [tenants]
   );

   const onDeleteRole = useCallback(
      (ur: UserWithRole) => {
         setDeletingUserRole({
            userId: ur.user.id,
            organizacaoId: ur.organizacao_id,
            roleId: ur.role.id,
            userName: `${ur.user.p_g} ${ur.user.nome_guerra}`,
            roleName: ur.role.name,
            orgLabel: orgLabel(ur.organizacao_id, tenants),
         });
         setShowDelModal(true);
      },
      [tenants]
   );

   const delUserRole = useCallback(async () => {
      if (!deletingUserRole) return;

      const { userId, roleId, organizacaoId } = deletingUserRole;
      try {
         const result = await deleteMutation.mutateAsync({
            roleId,
            userId,
            organizacaoId,
         });
         if (result.ok) {
            push({ type: "success", message: result.message });
            setShowDelModal(false);
            setDeletingUserRole(null);
         } else {
            push({ type: "error", message: result.message });
         }
      } catch (error) {
         console.error("deleteUserRole failed", error);
         push({ type: "error", message: "Erro ao deletar perfil" });
      }
   }, [deletingUserRole, deleteMutation, push]);

   return (
      <>
         <UserEditRole
            show={showEditModal}
            setShow={setShowEditModal}
            roles={roles}
            editing={editingRole}
         />

         <ConfirmModal
            show={showDelModal}
            title="Remover perfil?"
            description={
               deletingUserRole ? (
                  <>
                     Remover o perfil{" "}
                     <strong className="uppercase">
                        {deletingUserRole.roleName}
                     </strong>{" "}
                     de{" "}
                     <strong className="uppercase">
                        {deletingUserRole.userName}
                     </strong>{" "}
                     em <strong>{deletingUserRole.orgLabel}</strong>?
                  </>
               ) : (
                  ""
               )
            }
            isLoading={deleteMutation.isPending}
            onClose={() => setShowDelModal(false)}
            onConfirm={delUserRole}
            confirmButtonText="Sim, remover"
         />

         {isDev && (
            <ConfirmModal
               show={devLogin.showModal}
               title="Login como usuário?"
               description="Você será redirecionado e terá as mesmas permissões deste usuário."
               isLoading={devLogin.isLoggingIn}
               onClose={() => devLogin.setShowModal(false)}
               onConfirm={devLogin.confirmLogin}
               icon={FaArrowRightToBracket}
               iconColor="text-blue-500"
               confirmButtonColor="blue"
               confirmButtonText="Fazer Login"
            />
         )}

         <div
            className={clsx("transition-opacity", isFetching && "opacity-50")}
         >
            <UsersTable
               filteredUsers={filteredUsers}
               filterName={filterName}
               roleFilter={roleFilter}
               roleOptions={roleOptions}
               currentUserId={currentUserId}
               isUpdating={isFetching}
               editDisabled={editDisabled}
               tenants={tenants}
               showDevLogin={isDev}
               onFilterChange={setFilterName}
               onRoleFilterChange={setRoleFilter}
               onClearFilters={onClearFilters}
               onRefresh={onRefresh}
               onEditRole={onEditRole}
               onDevLogin={devLogin.requestLogin}
               onDeleteRole={onDeleteRole}
            />
         </div>
      </>
   );
});
