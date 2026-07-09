"use client";

import { useState } from "react";
import { useUsersRoles, useRoles } from "@/hooks/queries/useRoles";
import { useTenants } from "@/hooks/queries/useTenants";
import { AcessosHeader } from "./components/AcessosHeader";
import { AcessosSkeleton } from "./components/AcessosSkeleton";
import { UsersTab } from "./components/UsersTab";
import UserAddRole from "./components/UserAddRole";

export default function AcessosPage() {
   const { data: userRoles, isPending, isFetching, refetch } = useUsersRoles();
   const { data: roles = [] } = useRoles();
   const { data: tenants = [] } = useTenants();

   const [showAddModal, setShowAddModal] = useState(false);

   return (
      <div className="space-y-2">
         <AcessosHeader
            count={userRoles?.length}
            onAdd={() => setShowAddModal(true)}
         />

         {isPending || !userRoles ? (
            <AcessosSkeleton />
         ) : (
            <UsersTab
               userRoles={userRoles}
               roles={roles}
               tenants={tenants}
               isFetching={isFetching}
               onRefresh={() => refetch()}
            />
         )}

         <UserAddRole
            show={showAddModal}
            setShow={setShowAddModal}
            roles={roles}
            tenants={tenants}
            existingRoles={userRoles ?? []}
         />
      </div>
   );
}
