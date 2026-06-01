import { memo, useState, useCallback, useMemo } from "react";
import { UsersTable } from "./UsersTable";
import { RolesTable } from "./RolesTable";
import UserAddRole from "./userAddRole";
import UserEditRole, { type EditingRole } from "./UserEditRole";
import type { UserWithRole, RoleDetail } from "../../config/types";
import type { Organizacao } from "services/routes/organizacoes";
import { deleteUserRole } from "services/routes/security/roles";
import { devLogin as devLoginApi } from "services/routes/auth";
import { setCookie } from "cookies-next";
import { getQueryClient } from "@/lib/queryClient";
import { useToast } from "@/app/context/toast";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FaArrowRightToBracket } from "react-icons/fa6";

interface UsersTabProps {
   userRoles: UserWithRole[];
   roles: RoleDetail[];
   orgs: Organizacao[];
   onRefreshUsers: () => Promise<void>;
}

export const UsersTab = memo(function UsersTab({
   userRoles,
   roles,
   orgs,
   onRefreshUsers,
}: UsersTabProps) {
   const [filterName, setFilterName] = useState("");
   const [isUpdating, setIsUpdating] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);

   const [showEditModal, setShowEditModal] = useState(false);
   const [editingRole, setEditingRole] = useState<EditingRole | null>(null);

   const [showDelModal, setShowDelModal] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [deletingUserRole, setDeletingUserRole] = useState<{
      userId: number;
      roleId: number;
      organizacaoId: string | null;
      userName: string;
   } | null>(null);

   const [showLoginModal, setShowLoginModal] = useState(false);
   const [loginUserId, setLoginUserId] = useState<number | null>(null);
   const [isLoggingIn, setIsLoggingIn] = useState(false);

   const debouncedFilter = useDebouncedValue(filterName, 400);
   const { push } = useToast();

   const filteredUsers = useMemo((): UserWithRole[] => {
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
   }, [debouncedFilter, userRoles]);

   const updateUserRoles = useCallback(async () => {
      setIsUpdating(true);
      try {
         await onRefreshUsers();
      } finally {
         setIsUpdating(false);
      }
   }, [onRefreshUsers]);

   const onEditRole = useCallback(
      (ur: UserWithRole) => {
         const orgLabel =
            ur.organizacao_id === null
               ? "Sistema"
               : (orgs.find((o) => o.sigla === ur.organizacao_id)?.sigla ??
                 ur.organizacao_id);

         setEditingRole({
            userId: ur.user.id,
            userLabel: `${ur.user.p_g} ${ur.user.nome_guerra}`,
            organizacaoId: ur.organizacao_id,
            orgLabel,
            currentRoleId: ur.role.id,
         });
         setShowEditModal(true);
      },
      [orgs]
   );

   const delUserRole = useCallback(async () => {
      if (!deletingUserRole) return;

      const { userId, roleId, organizacaoId } = deletingUserRole;
      setIsDeleting(true);
      try {
         const result = await deleteUserRole(roleId, userId, organizacaoId);
         if (result.ok) {
            push({ type: "success", message: result.message });
            setShowDelModal(false);
            setDeletingUserRole(null);
            await updateUserRoles();
         } else {
            push({ type: "error", message: result.message });
         }
      } catch (error) {
         console.error("deleteUserRole failed", error);
         push({ type: "error", message: "Erro ao deletar perfil" });
      } finally {
         setIsDeleting(false);
      }
   }, [deletingUserRole, push, updateUserRoles]);

   const devLogin = useCallback(async () => {
      if (!loginUserId) return;

      setIsLoggingIn(true);
      try {
         const result = await devLoginApi(loginUserId);

         if (!result.ok) {
            push({
               type: "error",
               message: result.message || "Erro ao fazer login",
            });
            return;
         }

         if (result.data?.access_token) {
            getQueryClient().clear();
            setCookie("token", result.data.access_token, {
               maxAge: 24 * 60 * 60,
               path: "/",
            });

            push({
               type: "success",
               message: "Login realizado com sucesso!",
            });

            window.location.href = "/";
         } else {
            push({
               type: "error",
               message: "Token não recebido do servidor",
            });
         }
      } catch (error) {
         console.error("devLogin failed", error);
         push({
            type: "error",
            message: "Erro ao fazer login como usuário",
         });
      } finally {
         setIsLoggingIn(false);
      }
   }, [loginUserId, push]);

   return (
      <>
         <UserAddRole
            show={showAddModal}
            setShow={setShowAddModal}
            update={updateUserRoles}
            roles={roles}
            orgs={orgs}
         />

         <UserEditRole
            show={showEditModal}
            setShow={setShowEditModal}
            update={updateUserRoles}
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
            isLoading={isDeleting}
            onClose={() => setShowDelModal(false)}
            onConfirm={delUserRole}
            confirmButtonText="Sim, remover"
         />

         <ConfirmModal
            show={showLoginModal}
            title="Login como usuário?"
            description="Você será redirecionado e terá as mesmas permissões deste usuário."
            isLoading={isLoggingIn}
            onClose={() => setShowLoginModal(false)}
            onConfirm={devLogin}
            icon={FaArrowRightToBracket}
            iconColor="text-blue-500"
            confirmButtonColor="blue"
            confirmButtonText="Fazer Login"
         />

         <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-slate-300 lg:col-span-2">
               <UsersTable
                  filteredUsers={filteredUsers}
                  filterName={filterName}
                  isUpdating={isUpdating}
                  onFilterChange={setFilterName}
                  onRefresh={updateUserRoles}
                  onAddUser={() => setShowAddModal(true)}
                  onEditRole={onEditRole}
                  onDevLogin={(userId) => {
                     setLoginUserId(userId);
                     setShowLoginModal(true);
                  }}
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
            <div>
               <RolesTable roles={roles} />
            </div>
         </div>
      </>
   );
});
