"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { useUsersRoles, useRoles } from "@/hooks/queries/useRoles";
import { useTenants } from "@/hooks/queries/useTenants";
import { AcessosHeader } from "./components/AcessosHeader";
import { AcessosSkeleton } from "./components/AcessosSkeleton";
import { UsersTab } from "./components/UsersTab";
import UserAddRole from "./components/UserAddRole";

export default function AcessosPage() {
   const {
      data: userRoles,
      isPending,
      isFetching,
      isError,
      refetch,
   } = useUsersRoles();
   // Queries secundárias: alimentam os selects dos modais (perfis, orgs) e o
   // rótulo do escopo. Falha delas não derruba a lista, mas é dita — senão o
   // modal abriria com select vazio, como se não houvesse perfil nenhum.
   const {
      data: rolesData,
      isError: rolesError,
      isFetching: rolesFetching,
      refetch: refetchRoles,
   } = useRoles();
   const {
      data: tenantsData,
      isError: tenantsError,
      isFetching: tenantsFetching,
      refetch: refetchTenants,
   } = useTenants();
   const roles = rolesData ?? [];
   const tenants = tenantsData ?? [];

   const [showAddModal, setShowAddModal] = useState(false);

   const catalogoErro =
      (rolesError && !rolesData) || (tenantsError && !tenantsData);

   return (
      <div className="space-y-2">
         <AcessosHeader
            count={userRoles?.length}
            onAdd={() => setShowAddModal(true)}
            addDisabled={!rolesData || !tenantsData}
         />

         {catalogoErro && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível carregar perfis e organizações — adicionar e
                  editar acessos ficam indisponíveis
               </span>
               <button
                  type="button"
                  onClick={() => {
                     if (rolesError) refetchRoles();
                     if (tenantsError) refetchTenants();
                  }}
                  disabled={rolesFetching || tenantsFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}

         {isPending ? (
            <AcessosSkeleton />
         ) : !userRoles ? (
            // Falha sem lista em tela: o skeleton ficaria preso para sempre
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  Erro ao carregar os acessos. Por favor, tente novamente.
               </p>
               <Button
                  color="light"
                  size="xs"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : (
            <>
               {/* Refetch que falhou com a lista em tela: mantém e avisa */}
               {isError && (
                  <p
                     role="status"
                     className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                  >
                     <span className="min-w-0 flex-1 truncate">
                        Não foi possível atualizar a lista
                     </span>
                     <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                     >
                        Tentar novamente
                     </button>
                  </p>
               )}
               <UsersTab
                  userRoles={userRoles}
                  roles={roles}
                  tenants={tenants}
                  isFetching={isFetching}
                  editDisabled={!rolesData}
                  onRefresh={() => refetch()}
               />
            </>
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
