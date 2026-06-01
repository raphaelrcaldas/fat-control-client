"use client";

import { useState, useEffect, useCallback } from "react";
import {
   getUsersRoles,
   getRoles,
   type UserWithRole,
   type RoleDetail,
} from "services/routes/security/roles";
import {
   getOrganizacoes,
   type Organizacao,
} from "services/routes/organizacoes";
import { useToast } from "@/app/context/toast";
import { sortByAntiguidadeInPlace } from "utils/sortByAntiguidade";
import { FaUsers, FaShieldHalved, FaCubes, FaKey } from "react-icons/fa6";
import { Tabs, TabItem } from "flowbite-react";
import { UsersTab } from "./components/users/UsersTab";
import RolesTab from "./components/roles/RolesTab";
import ResourcesTab from "./components/resources/ResourcesTab";
import PermissionsTab from "./components/permissions/PermissionsTab";
import { TableSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function RolePage() {
   const [userRoles, setUserRoles] = useState<UserWithRole[] | null>(null);
   const [roles, setRoles] = useState<RoleDetail[]>([]);
   const [orgs, setOrgs] = useState<Organizacao[]>([]);

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
            const [usersRolesData, rolesData, orgsData] = await Promise.all([
               getUsersRoles(),
               getRoles(),
               getOrganizacoes(),
            ]);

            sortByAntiguidadeInPlace(usersRolesData);
            setUserRoles(usersRolesData);
            setRoles(rolesData);
            setOrgs(orgsData);
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
         <div className="space-y-6 p-4">
            <div className="flex gap-4 border-b pb-2">
               {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24" />
               ))}
            </div>
            <TableSkeleton rows={10} cols={3} />
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
                  orgs={orgs}
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
