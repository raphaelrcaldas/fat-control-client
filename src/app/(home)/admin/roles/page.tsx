"use client";

import { useState, useEffect, useCallback } from "react";
import {
   getUsersRoles,
   getRoles,
   type UserWithRole,
   type RoleDetail,
} from "services/routes/security/roles";
import {
   getResources,
   getPermissions,
   type Resource,
   type PermissionDetail,
} from "services/routes/security/resources";
import { useToast } from "@/app/context/toast";
import { FaUsers, FaShield } from "react-icons/fa6";
import { Tabs, TabItem } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { UsersTab, PermissionsMatrixTab } from "./components";

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<RoleDetail[]>([]);
   const [resources, setResources] = useState<Resource[] | null>(null);
   const [permissions, setPermissions] = useState<PermissionDetail[] | null>(
      null
   );

   const { push } = useToast();

   const refreshUserRoles = useCallback(async () => {
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
      }
   }, [push]);

   useEffect(() => {
      const loadAllData = async () => {
         try {
            const [usersRolesData, rolesData, resourcesData, permissionsData] =
               await Promise.all([
                  getUsersRoles(),
                  getRoles(),
                  getResources(),
                  getPermissions(),
               ]);

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

            setUserRoles(usersRolesData);
            setRoles(rolesData);
            setResources(resourcesData);
            setPermissions(permissionsData);
         } catch (error) {
            push({
               type: "error",
               message: "Erro ao carregar dados",
            });
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
      <div className='p-2 grid gap-4'>
         <Tabs
            aria-label='Tabs de gerenciamento de perfis'
            variant='underline'
         >
            <TabItem active title='Usuários' icon={FaUsers}>
               <UsersTab
                  userRoles={userRoles}
                  roles={roles}
                  onRefreshUsers={refreshUserRoles}
               />
            </TabItem>

            <TabItem title='Permissões' icon={FaShield}>
               <PermissionsMatrixTab
                  resources={resources}
                  permissions={permissions}
                  roles={roles}
               />
            </TabItem>
         </Tabs>
      </div>
   );
}
