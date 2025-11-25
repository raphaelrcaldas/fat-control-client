"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
   getUsersRoles,
   getRoles,
   updateUserRole,
   deleteUserRole,
   type UserWithRole,
   type RoleDetail,
} from "services/routes/security/roles";
import {
   getResources,
   getPermissions,
   type Resource,
   type PermissionDetail,
} from "services/routes/security/resources";
import { devLogin as devLoginApi } from "services/routes/auth";
import { setCookie } from "cookies-next";
import { useToast } from "@/app/context/toast";
import { FaUserShield, FaUsers, FaShield } from "react-icons/fa6";
import { Badge, Tabs, TabItem } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import UserAddRole from "./components/userAddRole";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { UsersTab, PermissionsMatrixTab } from "./components";
import type { PermissionMatrixType } from "./components";

// Mover função para fora do componente (melhor performance)
const buildPermissionMatrix = (
   allPermissions: PermissionDetail[],
   allRolesDetails: RoleDetail[]
): PermissionMatrixType => {
   const matrix: PermissionMatrixType = {};

   allPermissions.forEach((perm) => {
      if (!matrix[perm.resource]) {
         matrix[perm.resource] = {};
      }
      matrix[perm.resource][perm.action] = {
         permissionId: perm.id,
         description: perm.description,
         roleIds: new Set(),
      };
   });

   allRolesDetails.forEach((roleDetail) => {
      roleDetail.permissions.forEach((perm) => {
         if (matrix[perm.resource] && matrix[perm.resource][perm.action]) {
            matrix[perm.resource][perm.action].roleIds.add(roleDetail.id);
         }
      });
   });

   return matrix;
};

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<RoleDetail[]>([]);
   const [showAddModal, setShowAddModal] = useState(false);
   const [filterName, setFilterName] = useState("");
   const [isUpdating, setIsUpdating] = useState(false);
   const debouncedFilter = useDebouncedValue(filterName, 400); // Otimizado: 220ms -> 400ms

   const [resources, setResources] = useState<Resource[] | null>(null);
   const [permissions, setPermissions] = useState<PermissionDetail[] | null>(
      null
   );
   const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);

   const { push } = useToast();

   // Memoizar matriz de permissões para evitar recálculo desnecessário
   const matrix = useMemo(() => {
      if (!permissions || !roles.length) return {};
      return buildPermissionMatrix(permissions, roles);
   }, [permissions, roles]);

   // Memoizar filtro para evitar recálculo a cada render
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

   // Memoizar função de atualização de usuários
   const updateUserRoles = useCallback(async () => {
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
   }, [push]);

   // Memoizar callbacks para evitar recriação
   const pathUserRole = useCallback(
      async (userId: number, roleId: string) => {
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
      },
      [push, updateUserRoles]
   );

   const devLogin = useCallback(
      async (userId: number) => {
         const confirmLogin = window.confirm(`Fazer login como este usuário?`);

         if (!confirmLogin) return;

         try {
            const response = await devLoginApi(userId);

            if (!response.ok) {
               const error = await response.json();
               push({
                  type: "error",
                  message: error.detail || "Erro ao fazer login",
               });
               return;
            }

            const data = await response.json();

            if (data.access_token) {
               setCookie("token", data.access_token, {
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

   // Consolidar TODAS as chamadas API em paralelo (Otimização crítica!)
   useEffect(() => {
      const loadAllData = async () => {
         setIsUpdating(true);
         setIsLoadingMatrix(true);

         try {
            // Executar TODAS as 4 APIs em paralelo (antes eram sequenciais)
            const [usersRolesData, rolesData, resourcesData, permissionsData] =
               await Promise.all([
                  getUsersRoles(),
                  getRoles(),
                  getResources(),
                  getPermissions(),
               ]);

            // Processar dados
            usersRolesData.sort((a, b) => {
               const antA = a.user.posto.ant;
               const antB = b.user.posto.ant;
               if (antA !== antB) return antA - antB;

               const promoA = a.user.ult_promo || "";
               const promoB = b.user.ult_promo || "";
               if (promoA !== promoB) return promoA.localeCompare(promoB);

               return (a.user.ant_rel ?? 0) - (b.user.ant_rel ?? 0);
            });

            resourcesData.sort((a, b) => a.name.localeCompare(b.name));
            permissionsData.sort((a, b) => {
               const resourceCompare = a.resource.localeCompare(b.resource);
               if (resourceCompare !== 0) return resourceCompare;
               return a.action.localeCompare(b.action);
            });

            // Atualizar estados
            setUserRoles(usersRolesData);
            setRoles(rolesData);
            setResources(resourcesData);
            setPermissions(permissionsData);
         } catch (error) {
            push({
               type: "error",
               message: "Erro ao carregar dados",
            });
         } finally {
            setIsUpdating(false);
            setIsLoadingMatrix(false);
         }
      };

      loadAllData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

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
            update={updateUserRoles}
            usersIgnr={userRoles.map((u) => u.user.id)}
            roles={roles}
         />

         <div className='p-2 grid gap-4'>
            <Tabs
               aria-label='Tabs de gerenciamento de perfis'
               variant='underline'
            >
               <TabItem active title='Usuários' icon={FaUsers}>
                  <UsersTab
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
               </TabItem>

               <TabItem title='Permissões' icon={FaShield}>
                  <PermissionsMatrixTab
                     isLoading={isLoadingMatrix}
                     resources={resources}
                     permissions={permissions}
                     matrix={matrix}
                     roles={roles}
                  />
               </TabItem>
            </Tabs>
         </div>
      </>
   );
}
