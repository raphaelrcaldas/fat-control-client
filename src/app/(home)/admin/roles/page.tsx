"use client";

import { useState, useEffect, useCallback } from "react";
import {
   getUsersRoles,
   getRoles,
   type UserWithRole,
   type RoleDetail,
} from "services/routes/security/roles";
import { useToast } from "@/app/context/toast";
import { sortByAntiguidadeInPlace } from "utils/sortByAntiguidade";
import { FaUsers, FaShieldHalved, FaCubes, FaKey } from "react-icons/fa6";
import { Tabs, TabItem, Spinner } from "flowbite-react";
import { UsersTab, RolesTab, ResourcesTab, PermissionsTab } from "./components";

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<RoleDetail[]>([]);

   const { push } = useToast();

   const refreshUserRoles = useCallback(async () => {
      try {
         const data = await getUsersRoles();
         sortByAntiguidadeInPlace(data);
         setUserRoles(data);
      } catch {
         push({
            type: "error",
            message: "Erro ao carregar perfis de usuários",
         });
      }
   }, [push]);

   useEffect(() => {
      const loadData = async () => {
         try {
            const [usersRolesData, rolesData] = await Promise.all([
               getUsersRoles(),
               getRoles(),
            ]);

            sortByAntiguidadeInPlace(usersRolesData);
            setUserRoles(usersRolesData);
            setRoles(rolesData);
         } catch {
            push({
               type: "error",
               message: "Erro ao carregar dados",
            });
         }
      };

      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   if (!userRoles) {
      return (
         <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-3">
               <Spinner color="failure" size="xl" />
               <span className="text-gray-600">Carregando perfis...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="grid gap-4 p-2">
         <Tabs aria-label="Tabs de gerenciamento de perfis" variant="underline">
            <TabItem active title="Usuários" icon={FaUsers}>
               <UsersTab
                  userRoles={userRoles}
                  roles={roles}
                  onRefreshUsers={refreshUserRoles}
               />
            </TabItem>

            <TabItem title="Roles" icon={FaShieldHalved}>
               <RolesTab />
            </TabItem>

            <TabItem title="Recursos" icon={FaCubes}>
               <ResourcesTab />
            </TabItem>

            <TabItem title="Permissões" icon={FaKey}>
               <PermissionsTab />
            </TabItem>
         </Tabs>
      </div>
   );
}
