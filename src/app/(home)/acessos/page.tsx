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
import { UsersTab } from "./components/UsersTab";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AcessosPage() {
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
            message: "Erro ao carregar vínculos de acesso",
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
            <TableSkeleton rows={10} cols={3} />
         </div>
      );
   }

   return (
      <div className="grid gap-4 p-2">
         <UsersTab
            userRoles={userRoles}
            roles={roles}
            orgs={orgs}
            onRefreshUsers={refreshUserRoles}
         />
      </div>
   );
}
