import { memo, useState, useCallback, useMemo } from "react";
import { UsersTable } from "./UsersTable";
import { RolesTable } from "./RolesTable";
import UserAddRole from "./userAddRole";
import type { UserWithRole, RoleDetail } from "../../config/types";
import { updateUserRole, deleteUserRole } from "services/routes/security/roles";
import { devLogin as devLoginApi } from "services/routes/auth";
import { setCookie } from "cookies-next";
import { useToast } from "@/app/context/toast";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FaArrowRightToBracket } from "react-icons/fa6";

interface UsersTabProps {
   userRoles: UserWithRole[];
   roles: RoleDetail[];
   onRefreshUsers: () => Promise<void>;
}

export const UsersTab = memo(function UsersTab({
   userRoles,
   roles,
   onRefreshUsers,
}: UsersTabProps) {
   const [filterName, setFilterName] = useState("");
   const [isUpdating, setIsUpdating] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);

   const [showDelModal, setShowDelModal] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [deletingUserRole, setDeletingUserRole] = useState<{
      userId: number;
      roleId: number;
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

   const pathUserRole = useCallback(
      async (userId: number, roleId: string) => {
         try {
            const result = await updateUserRole(roleId, userId);
            if (result.ok) {
               push({ type: "success", message: result.message });
               updateUserRoles();
            } else {
               push({ type: "error", message: result.message });
            }
         } catch (error) {
            console.error("updateUserRole failed", error);
            push({ type: "error", message: "Erro ao atualizar perfil" });
         }
      },
      [push, updateUserRoles]
   );

   const delUserRole = useCallback(async () => {
      if (!deletingUserRole) return;

      const { userId, roleId } = deletingUserRole;
      setIsDeleting(true);
      try {
         const result = await deleteUserRole(roleId, userId);
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
            setCookie("token", result.data.access_token, {
               maxAge: 24 * 60 * 60,
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
            usersIgnr={userRoles.map((u) => u.user.id)}
            roles={roles}
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
            <div className="lg:col-span-2">
               <UsersTable
                  filteredUsers={filteredUsers}
                  roles={roles}
                  filterName={filterName}
                  isUpdating={isUpdating}
                  onFilterChange={setFilterName}
                  onRefresh={updateUserRoles}
                  onAddUser={() => setShowAddModal(true)}
                  onRoleChange={pathUserRole}
                  onDevLogin={(userId) => {
                     setLoginUserId(userId);
                     setShowLoginModal(true);
                  }}
                  onDeleteRole={(userId, roleId, userName) => {
                     setDeletingUserRole({ userId, roleId, userName });
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
