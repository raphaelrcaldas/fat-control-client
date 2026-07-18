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
import { useUserRoleFilter } from "../hooks/useUserRoleFilter";
import { useDevLogin } from "../hooks/useDevLogin";

interface UsersTabProps {
   userRoles: UserWithRole[];
   roles: RoleDetail[];
   tenants: Tenant[];
   isFetching: boolean;
   onRefresh: () => void;
}

export const UsersTab = memo(function UsersTab({
   userRoles,
   roles,
   tenants,
   isFetching,
   onRefresh,
}: UsersTabProps) {
   const { push } = useToast();
   const { userId: currentUserId } = useAuth();
   const { filterName, setFilterName, filteredUsers } =
      useUserRoleFilter(userRoles);

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
         const orgLabel =
            ur.organizacao_id === null
               ? "Sistema"
               : (tenants.find((t) => t.organizacao_id === ur.organizacao_id)
                    ?.organizacao.sigla ?? ur.organizacao_id);

         setEditingRole({
            userId: ur.user.id,
            userLabel: `${ur.user.p_g} ${ur.user.nome_guerra}`,
            organizacaoId: ur.organizacao_id,
            orgLabel,
            currentRoleId: ur.role.id,
         });
         setShowEditModal(true);
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
               deletingUserRole
                  ? `Tem certeza que deseja remover o perfil de ${deletingUserRole.userName.toUpperCase()}?`
                  : ""
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
               currentUserId={currentUserId}
               isUpdating={isFetching}
               tenants={tenants}
               showDevLogin={isDev}
               onFilterChange={setFilterName}
               onRefresh={onRefresh}
               onEditRole={onEditRole}
               onDevLogin={devLogin.requestLogin}
               onDeleteRole={(userId, organizacaoId, roleId, userName) => {
                  setDeletingUserRole({
                     userId,
                     organizacaoId,
                     roleId,
                     userName,
                  });
                  setShowDelModal(true);
               }}
            />
         </div>
      </>
   );
});
