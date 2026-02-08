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
            push({ type: "error", message: "Erro ao atualizar perfil" });
         }
      },
      [push, updateUserRoles]
   );

   const delUserRole = useCallback(
      async (userId: number, roleId: number, userName: string) => {
         const confirmDel = window.confirm(
            `Tem certeza que deseja remover o perfil de ${userName.toUpperCase()}?`
         );

         if (confirmDel) {
            try {
               const result = await deleteUserRole(roleId, userId);
               if (result.ok) {
                  push({ type: "success", message: result.message });
                  updateUserRoles();
               } else {
                  push({ type: "error", message: result.message });
               }
            } catch (error) {
               push({ type: "error", message: "Erro ao deletar perfil" });
            }
         }
      },
      [push, updateUserRoles]
   );

   const devLogin = useCallback(
      async (userId: number) => {
         const confirmLogin = window.confirm(`Fazer login como este usuário?`);

         if (!confirmLogin) return;

         try {
            const result = await devLoginApi(userId);

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
            push({
               type: "error",
               message: "Erro ao fazer login como usuário",
            });
         }
      },
      [push]
   );

   return (
      <>
         <UserAddRole
            show={showAddModal}
            setShow={setShowAddModal}
            update={updateUserRoles}
            usersIgnr={userRoles.map((u) => u.user.id)}
            roles={roles}
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
                  onDevLogin={devLogin}
                  onDeleteRole={delUserRole}
               />
            </div>
            <div>
               <RolesTable roles={roles} />
            </div>
         </div>
      </>
   );
});
