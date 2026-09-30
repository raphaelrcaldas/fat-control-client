"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { FaShieldHalved } from "react-icons/fa6";
import {
   useAddRolePermission,
   usePermissions,
   useRemoveRolePermission,
   useRoles,
} from "@/hooks/queries/useSecurity";
import { useToast } from "@/app/context/toast";
import { getRoleTheme } from "@/constants/admin/roles";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PermissionDetail } from "services/routes/security/roles";
import { AddPermissionModal } from "./AddPermissionModal";
import { RemovePermissionModal } from "./RemovePermissionModal";
import { RoleCard } from "./RoleCard";
import { RolesListSkeleton } from "./RolesListSkeleton";

export default function RolesTab() {
   const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
   const [addRoleId, setAddRoleId] = useState<number | null>(null);
   const [removing, setRemoving] = useState<{
      roleId: number;
      roleName: string;
      permission: PermissionDetail;
   } | null>(null);

   const {
      data: roles,
      isLoading: loadingRoles,
      isError: rolesError,
      isFetching: fetchingRoles,
      refetch: refetchRoles,
   } = useRoles();
   const {
      data: allPermissions,
      isLoading: loadingPermissions,
      isError: permissionsError,
      isFetching: fetchingPermissions,
      refetch: refetchPermissions,
   } = usePermissions();
   const addRolePermission = useAddRolePermission();
   const removeRolePermission = useRemoveRolePermission();
   const { push } = useToast();

   const totalPermissions = allPermissions?.length ?? 0;

   const addRole = useMemo(
      () => roles?.find((r) => r.id === addRoleId) ?? null,
      [roles, addRoleId]
   );

   const handleAddPermission = async (permissionId: number) => {
      if (!addRoleId) return;
      try {
         const result = await addRolePermission.mutateAsync({
            roleId: addRoleId,
            permissionId,
         });
         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Permissão adicionada com sucesso",
            });
            setAddRoleId(null);
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao adicionar permissão",
            });
         }
      } catch (error) {
         console.error("addRolePermission failed", error);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const handleRemovePermission = async () => {
      if (!removing) return;
      try {
         const result = await removeRolePermission.mutateAsync({
            roleId: removing.roleId,
            permissionId: removing.permission.id,
         });
         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Permissão removida com sucesso",
            });
            setRemoving(null);
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao remover permissão",
            });
         }
      } catch (error) {
         console.error("removeRolePermission failed", error);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   if (loadingRoles || loadingPermissions) {
      return <RolesListSkeleton />;
   }

   const hasError = rolesError || permissionsError;
   const isFetching = fetchingRoles || fetchingPermissions;
   const retry = () => {
      // Só refaz o que falhou: a query que já deu certo não precisa voltar
      if (rolesError) refetchRoles();
      if (permissionsError) refetchPermissions();
   };

   // Os cards dependem das duas listas (o total de permissões alimenta a barra
   // de cada perfil): sem uma delas, a falha é dita como falha — nunca como
   // "Nenhum perfil encontrado".
   if (hasError && (!roles || !allPermissions)) {
      return (
         <div
            role="alert"
            className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
         >
            <p className="text-sm text-red-800">
               Não foi possível carregar os perfis. Por favor, tente novamente.
            </p>
            <Button
               color="light"
               size="xs"
               onClick={retry}
               disabled={isFetching}
            >
               Tentar novamente
            </Button>
         </div>
      );
   }

   if (!roles || roles.length === 0) {
      return (
         <EmptyState icon={FaShieldHalved} title="Nenhum perfil encontrado" />
      );
   }

   return (
      <>
         <div className="space-y-3">
            {/* Refetch que falhou com dado em tela: mantém os cards e avisa */}
            {hasError && (
               <p
                  role="status"
                  className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
               >
                  <span className="min-w-0 flex-1 truncate">
                     Não foi possível atualizar os perfis
                  </span>
                  <button
                     type="button"
                     onClick={retry}
                     disabled={isFetching}
                     className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                  >
                     Tentar novamente
                  </button>
               </p>
            )}
            {roles.map((role) => (
               <RoleCard
                  key={role.id}
                  role={role}
                  totalPermissions={totalPermissions}
                  isExpanded={expandedRoleId === role.id}
                  onToggle={() =>
                     setExpandedRoleId(
                        expandedRoleId === role.id ? null : role.id
                     )
                  }
                  onAddPermission={() => setAddRoleId(role.id)}
                  onRemovePermission={(permission) =>
                     setRemoving({
                        roleId: role.id,
                        roleName: getRoleTheme(role.name).label || role.name,
                        permission,
                     })
                  }
                  removeDisabled={removeRolePermission.isPending}
               />
            ))}
         </div>

         <AddPermissionModal
            show={addRoleId !== null}
            role={addRole}
            allPermissions={allPermissions}
            isPending={addRolePermission.isPending}
            onClose={() => setAddRoleId(null)}
            onConfirm={handleAddPermission}
         />

         {removing && (
            <RemovePermissionModal
               show
               roleLabel={removing.roleName}
               permission={removing.permission}
               isPending={removeRolePermission.isPending}
               onClose={() => setRemoving(null)}
               onConfirm={handleRemovePermission}
            />
         )}
      </>
   );
}
