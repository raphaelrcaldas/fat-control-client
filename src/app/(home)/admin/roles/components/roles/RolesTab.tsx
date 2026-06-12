"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import {
   Button,
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Select,
   Spinner,
} from "flowbite-react";
import {
   FaChevronDown,
   FaPlus,
   FaShieldHalved,
   FaXmark,
} from "react-icons/fa6";
import {
   useRoles,
   usePermissions,
   useAddRolePermission,
   useRemoveRolePermission,
} from "@/hooks/queries/useSecurity";
import { useToast } from "@/app/context/toast";
import {
   getRoleTheme,
   getActionChipTheme,
   compareActions,
} from "@/constants/admin/roles";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PermissionDetail } from "services/routes/security/roles";

export default function RolesTab() {
   const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
   const [selectedPermissionId, setSelectedPermissionId] = useState<
      number | null
   >(null);

   const [removing, setRemoving] = useState<{
      roleId: number;
      roleName: string;
      permission: PermissionDetail;
   } | null>(null);

   const { data: roles, isLoading: loadingRoles } = useRoles();
   const { data: allPermissions, isLoading: loadingPermissions } =
      usePermissions();
   const addRolePermission = useAddRolePermission();
   const removeRolePermission = useRemoveRolePermission();
   const { push } = useToast();

   const totalPermissions = allPermissions?.length ?? 0;

   const selectedRole = useMemo(() => {
      if (!selectedRoleId || !roles) return null;
      return roles.find((r) => r.id === selectedRoleId) || null;
   }, [selectedRoleId, roles]);

   // Permissões ainda não concedidas ao perfil, agrupadas por recurso
   const availablePermissionGroups = useMemo(() => {
      if (!selectedRole || !allPermissions) return [];
      const currentIds = new Set(selectedRole.permissions.map((p) => p.id));
      const available = allPermissions.filter((p) => !currentIds.has(p.id));

      const grouped = new Map<string, typeof available>();
      available.forEach((p) => {
         const group = grouped.get(p.resource) ?? [];
         group.push(p);
         grouped.set(p.resource, group);
      });
      return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
   }, [selectedRole, allPermissions]);

   const hasAvailablePermissions = availablePermissionGroups.length > 0;

   const handleToggleExpand = (roleId: number) => {
      setExpandedRoleId(expandedRoleId === roleId ? null : roleId);
   };

   const handleOpenAddModal = (roleId: number) => {
      setSelectedRoleId(roleId);
      setSelectedPermissionId(null);
      setShowAddModal(true);
   };

   const handleCloseAddModal = () => {
      setShowAddModal(false);
      setSelectedRoleId(null);
      setSelectedPermissionId(null);
   };

   const handleAddPermission = async () => {
      if (!selectedRoleId || !selectedPermissionId) return;

      try {
         const result = await addRolePermission.mutateAsync({
            roleId: selectedRoleId,
            permissionId: selectedPermissionId,
         });

         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Permissão adicionada com sucesso",
            });
            handleCloseAddModal();
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

   const groupPermissionsByResource = (permissions: PermissionDetail[]) => {
      const seen = new Set<number>();
      const grouped: Record<string, PermissionDetail[]> = {};
      permissions.forEach((p) => {
         if (seen.has(p.id)) return;
         seen.add(p.id);
         if (!grouped[p.resource]) {
            grouped[p.resource] = [];
         }
         grouped[p.resource].push(p);
      });
      Object.values(grouped).forEach((perms) =>
         perms.sort((a, b) => compareActions(a.action, b.action))
      );
      return Object.fromEntries(
         Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
      );
   };

   if (loadingRoles || loadingPermissions) {
      return <RolesListSkeleton />;
   }

   if (!roles || roles.length === 0) {
      return (
         <EmptyState icon={FaShieldHalved} title="Nenhum perfil encontrado" />
      );
   }

   return (
      <>
         <div className="space-y-3">
            {roles.map((role) => {
               const theme = getRoleTheme(role.name);
               const isExpanded = expandedRoleId === role.id;
               const grantedCount = new Set(role.permissions.map((p) => p.id))
                  .size;
               const coverage =
                  totalPermissions > 0
                     ? Math.round((grantedCount / totalPermissions) * 100)
                     : 0;
               const groupedPermissions = groupPermissionsByResource(
                  role.permissions
               );

               return (
                  <div
                     key={role.id}
                     className={clsx(
                        "overflow-hidden rounded-xl border bg-white shadow-sm transition-colors dark:bg-gray-800",
                        isExpanded
                           ? "border-gray-300 dark:border-gray-600"
                           : "border-gray-200 dark:border-gray-700"
                     )}
                  >
                     <button
                        onClick={() => handleToggleExpand(role.id)}
                        aria-expanded={isExpanded}
                        className={clsx(
                           "flex w-full items-center gap-4 p-4 text-left transition-colors",
                           theme.hover
                        )}
                     >
                        <div
                           className={clsx(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                              theme.bg
                           )}
                        >
                           <FaShieldHalved
                              className={clsx("h-4 w-4", theme.text)}
                           />
                        </div>

                        <div className="min-w-0 flex-1">
                           <span
                              className={clsx(
                                 "inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-semibold",
                                 theme.bg,
                                 theme.text
                              )}
                           >
                              {theme.label || role.name}
                           </span>
                           <p className="mt-1 ml-1 truncate text-sm text-gray-600 dark:text-gray-300">
                              {role.description}
                           </p>
                        </div>

                        <div className="hidden w-40 shrink-0 sm:block">
                           <div className="flex items-baseline justify-between text-xs">
                              <span className="font-semibold text-gray-700 tabular-nums dark:text-gray-200">
                                 {grantedCount}
                                 <span className="font-normal text-gray-400 dark:text-gray-500">
                                    /{totalPermissions}
                                 </span>
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                 {grantedCount === 1
                                    ? "permissão"
                                    : "permissões"}
                              </span>
                           </div>
                           <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                              <div
                                 className="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                                 style={{ width: `${coverage}%` }}
                              />
                           </div>
                        </div>

                        <FaChevronDown
                           className={clsx(
                              "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                           )}
                        />
                     </button>

                     <div
                        className={clsx(
                           "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                           isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
                           <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                              <div className="mb-3 flex items-center justify-between">
                                 <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                    Permissões concedidas
                                 </h3>
                                 <Button
                                    size="xs"
                                    color="red"
                                    onClick={() => handleOpenAddModal(role.id)}
                                 >
                                    <FaPlus className="mr-2 h-3 w-3" />
                                    Adicionar
                                 </Button>
                              </div>

                              {role.permissions.length === 0 ? (
                                 <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nenhuma permissão atribuída a este perfil
                                 </p>
                              ) : (
                                 <div className="space-y-2.5">
                                    {Object.entries(groupedPermissions).map(
                                       ([resource, permissions]) => (
                                          <div
                                             key={resource}
                                             className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3"
                                          >
                                             <span className="shrink-0 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:w-36 dark:text-gray-400">
                                                {resource}
                                             </span>
                                             <div className="flex flex-wrap gap-1.5">
                                                {permissions.map(
                                                   (permission) => {
                                                      const chip =
                                                         getActionChipTheme(
                                                            permission.action
                                                         );
                                                      return (
                                                         <span
                                                            key={permission.id}
                                                            title={
                                                               permission.description
                                                            }
                                                            className={clsx(
                                                               "inline-flex min-w-18 items-center justify-between gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-sm font-medium",
                                                               chip.bg,
                                                               chip.text,
                                                               chip.border
                                                            )}
                                                         >
                                                            {permission.action}
                                                            <button
                                                               onClick={() =>
                                                                  setRemoving({
                                                                     roleId:
                                                                        role.id,
                                                                     roleName:
                                                                        theme.label ||
                                                                        role.name,
                                                                     permission,
                                                                  })
                                                               }
                                                               className="rounded-full p-0.5 opacity-60 transition-all hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                                                               aria-label={`Remover ${permission.resource}.${permission.action}`}
                                                               disabled={
                                                                  removeRolePermission.isPending
                                                               }
                                                            >
                                                               <FaXmark className="h-3 w-3" />
                                                            </button>
                                                         </span>
                                                      );
                                                   }
                                                )}
                                             </div>
                                          </div>
                                       )
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         <Modal show={showAddModal} onClose={handleCloseAddModal} size="md">
            <ModalHeader>Adicionar Permissão</ModalHeader>
            <ModalBody>
               {selectedRole && (
                  <div className="space-y-4">
                     <div>
                        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                           Perfil
                        </label>
                        <div className="flex items-center gap-2">
                           <span
                              className={clsx(
                                 "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold",
                                 getRoleTheme(selectedRole.name).bg,
                                 getRoleTheme(selectedRole.name).text
                              )}
                           >
                              {getRoleTheme(selectedRole.name).label ||
                                 selectedRole.name}
                           </span>
                           <span className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedRole.description}
                           </span>
                        </div>
                     </div>

                     <div>
                        <label
                           htmlFor="permission-select"
                           className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                           Permissão
                        </label>
                        <Select
                           id="permission-select"
                           value={selectedPermissionId || ""}
                           onChange={(e) =>
                              setSelectedPermissionId(
                                 Number(e.target.value) || null
                              )
                           }
                           required
                        >
                           <option value="">Selecione uma permissão</option>
                           {availablePermissionGroups.map(
                              ([resource, permissions]) => (
                                 <optgroup key={resource} label={resource}>
                                    {permissions.map((permission) => (
                                       <option
                                          key={permission.id}
                                          value={permission.id}
                                       >
                                          {permission.action}
                                          {permission.description
                                             ? ` — ${permission.description}`
                                             : ""}
                                       </option>
                                    ))}
                                 </optgroup>
                              )
                           )}
                        </Select>
                        {!hasAvailablePermissions && (
                           <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Todas as permissões já foram atribuídas a este
                              perfil
                           </p>
                        )}
                     </div>
                  </div>
               )}
            </ModalBody>
            <ModalFooter>
               <Button
                  color="red"
                  onClick={handleAddPermission}
                  disabled={
                     !selectedPermissionId || addRolePermission.isPending
                  }
               >
                  {addRolePermission.isPending ? (
                     <>
                        <Spinner color="failure" size="sm" className="mr-2" />
                        Adicionando...
                     </>
                  ) : (
                     "Adicionar"
                  )}
               </Button>
               <Button color="gray" onClick={handleCloseAddModal}>
                  Cancelar
               </Button>
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={removing !== null}
            title="Remover permissão?"
            description={
               removing
                  ? `Remover a permissão "${removing.permission.resource}.${removing.permission.action}" do perfil ${removing.roleName}?`
                  : ""
            }
            isLoading={removeRolePermission.isPending}
            onClose={() => setRemoving(null)}
            onConfirm={handleRemovePermission}
            confirmButtonText="Sim, remover"
         />
      </>
   );
}

function RolesListSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div className="space-y-3">
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
               <div className="flex w-full items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                     <Skeleton className="h-5 w-32 rounded-md" />
                     <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="hidden w-40 space-y-2 sm:block">
                     <Skeleton className="h-3 w-full" />
                     <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4" />
               </div>
            </div>
         ))}
      </div>
   );
}
