"use client";

import { useState, useMemo } from "react";
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
   FaPlus,
   FaXmark,
   FaChevronDown,
   FaChevronUp,
   FaShieldHalved,
} from "react-icons/fa6";
import {
   useRoles,
   usePermissions,
   useAddRolePermission,
   useRemoveRolePermission,
} from "@/hooks/queries/useSecurity";
import { useToast } from "@/app/context/toast";
import { getRoleTheme } from "@/constants/admin/roles";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { PermissionDetail } from "services/routes/security/roles";

export default function RolesTab() {
   const [expandedRoleId, setExpandedRoleId] = useState<number | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
   const [selectedPermissionId, setSelectedPermissionId] = useState<
      number | null
   >(null);

   const [showRemoveModal, setShowRemoveModal] = useState(false);
   const [removingPermission, setRemovingPermission] = useState<{
      roleId: number;
      permissionId: number;
      roleName: string;
      permissionResource: string;
      permissionAction: string;
   } | null>(null);

   const { data: roles, isLoading: loadingRoles } = useRoles();
   const { data: allPermissions, isLoading: loadingPermissions } =
      usePermissions();
   const addRolePermission = useAddRolePermission();
   const removeRolePermission = useRemoveRolePermission();
   const { push } = useToast();

   const selectedRole = useMemo(() => {
      if (!selectedRoleId || !roles) return null;
      return roles.find((r) => r.id === selectedRoleId) || null;
   }, [selectedRoleId, roles]);

   const availablePermissions = useMemo(() => {
      if (!selectedRole || !allPermissions) return [];
      const currentPermissionIds = selectedRole.permissions.map((p) => p.id);
      return allPermissions.filter((p) => !currentPermissionIds.includes(p.id));
   }, [selectedRole, allPermissions]);

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

   const handleOpenRemoveModal = (
      roleId: number,
      permissionId: number,
      roleName: string,
      permissionResource: string,
      permissionAction: string
   ) => {
      setRemovingPermission({
         roleId,
         permissionId,
         roleName,
         permissionResource,
         permissionAction,
      });
      setShowRemoveModal(true);
   };

   const handleCloseRemoveModal = () => {
      setShowRemoveModal(false);
      setRemovingPermission(null);
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
      if (!removingPermission) return;

      const { roleId, permissionId } = removingPermission;

      try {
         const result = await removeRolePermission.mutateAsync({
            roleId,
            permissionId,
         });

         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Permissão removida com sucesso",
            });
            handleCloseRemoveModal();
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
      return grouped;
   };

   if (loadingRoles || loadingPermissions) {
      return (
         <div className="px-2 py-8">
            <TableSkeleton rows={6} cols={3} />
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
         <div className="space-y-4">
            {roles.map((role) => {
               const theme = getRoleTheme(role.name);
               const isExpanded = expandedRoleId === role.id;
               const groupedPermissions = groupPermissionsByResource(
                  role.permissions
               );

               return (
                  <div
                     key={role.id}
                     className={`overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-gray-800 ${isExpanded ? "border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700"}`}
                  >
                     <button
                        onClick={() => handleToggleExpand(role.id)}
                        className={`flex w-full items-center justify-between p-4 text-left transition-colors ${theme.hover}`}
                     >
                        <div className="flex items-center gap-3">
                           <div
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${theme.bg}`}
                           >
                              <FaShieldHalved
                                 className={`h-4 w-4 ${theme.text}`}
                              />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <span
                                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${theme.bg} ${theme.text}`}
                                 >
                                    {theme.label || role.name}
                                 </span>
                                 <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {role.permissions.length}{" "}
                                    {role.permissions.length === 1
                                       ? "permissão"
                                       : "permissões"}
                                 </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                 {role.description}
                              </p>
                           </div>
                        </div>
                        {isExpanded ? (
                           <FaChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                           <FaChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                     </button>

                     {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                           <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                 Permissões Atuais
                              </h3>
                              <Button
                                 size="xs"
                                 color="red"
                                 onClick={() => handleOpenAddModal(role.id)}
                              >
                                 <FaPlus className="mr-2 h-3 w-3" />
                                 Adicionar Permissão
                              </Button>
                           </div>

                           {role.permissions.length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                 Nenhuma permissão atribuída a este perfil
                              </p>
                           ) : (
                              <div className="space-y-4">
                                 {Object.entries(groupedPermissions).map(
                                    ([resource, permissions]) => (
                                       <div key={resource}>
                                          <h4 className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                             {resource}
                                          </h4>
                                          <div className="space-y-2">
                                             {permissions.map((permission) => (
                                                <div
                                                   key={permission.id}
                                                   className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                   <div className="min-w-0 flex-1">
                                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                         {permission.action}
                                                      </p>
                                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                                         {
                                                            permission.description
                                                         }
                                                      </p>
                                                   </div>
                                                   <button
                                                      onClick={() =>
                                                         handleOpenRemoveModal(
                                                            role.id,
                                                            permission.id,
                                                            role.name,
                                                            permission.resource,
                                                            permission.action
                                                         )
                                                      }
                                                      className="ml-3 rounded-md p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                      aria-label="Remover permissão"
                                                      disabled={
                                                         removeRolePermission.isPending
                                                      }
                                                   >
                                                      <FaXmark className="h-4 w-4" />
                                                   </button>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )
                                 )}
                              </div>
                           )}
                        </div>
                     )}
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
                              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getRoleTheme(selectedRole.name).bg} ${getRoleTheme(selectedRole.name).text}`}
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
                           {availablePermissions.map((permission) => (
                              <option key={permission.id} value={permission.id}>
                                 {permission.resource} &gt; {permission.action}
                              </option>
                           ))}
                        </Select>
                        {availablePermissions.length === 0 && (
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
               <Button color="gray" onClick={handleCloseAddModal}>
                  Cancelar
               </Button>
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
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={showRemoveModal}
            title="Remover permissão?"
            description={
               removingPermission
                  ? `Remover permissão "${removingPermission.permissionResource} > ${removingPermission.permissionAction}" do perfil ${getRoleTheme(removingPermission.roleName).label || removingPermission.roleName}?`
                  : ""
            }
            isLoading={removeRolePermission.isPending}
            onClose={handleCloseRemoveModal}
            onConfirm={handleRemovePermission}
            confirmButtonText="Sim, remover"
         />
      </>
   );
}
