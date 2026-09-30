"use client";

import { useMemo, useState } from "react";
import { Button, Select, TextInput } from "flowbite-react";
import { FaFilter, FaKey, FaMagnifyingGlass } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   usePermissions,
   useResources,
   useCreatePermission,
   useUpdatePermission,
   useDeletePermission,
} from "@/hooks/queries";
import type {
   PermissionCreate,
   PermissionDetail,
   PermissionUpdate,
} from "services/routes/security/resources";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { compareActions } from "@/constants/admin/roles";
import { PermissionFormModal } from "./PermissionFormModal";
import { PermissionsTable, PermissionsTableSkeleton } from "./PermissionsTable";

export default function PermissionsTab() {
   const { push } = useToast();

   // Queries
   // `data` cru (sem `= []`): a falha sem dado precisa ser distinguível do
   // vazio, senão "Nenhuma permissão cadastrada" mente depois de um erro
   const {
      data: permissionsData,
      isLoading: isLoadingPermissions,
      isFetching: isFetchingPermissions,
      error: permissionsError,
      refetch: refetchPermissions,
   } = usePermissions();
   const {
      data: resourcesData,
      isLoading: isLoadingResources,
      isFetching: isFetchingResources,
      error: resourcesError,
      refetch: refetchResources,
   } = useResources();
   const permissions = useMemo(() => permissionsData ?? [], [permissionsData]);
   const resources = useMemo(() => resourcesData ?? [], [resourcesData]);

   // Mutations
   const createMutation = useCreatePermission();
   const updateMutation = useUpdatePermission();
   const deleteMutation = useDeletePermission();

   // State
   const [showFormModal, setShowFormModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [editingPermission, setEditingPermission] =
      useState<PermissionDetail | null>(null);
   const [deletingPermission, setDeletingPermission] =
      useState<PermissionDetail | null>(null);
   const [resourceFilter, setResourceFilter] = useState<string>("all");
   const [searchTerm, setSearchTerm] = useState("");

   const filteredPermissions = useMemo(() => {
      const searchLower = searchTerm.trim().toLowerCase();
      return permissions.filter((p) => {
         const matchesResource =
            resourceFilter === "all" || p.resource === resourceFilter;
         if (!matchesResource) return false;
         if (!searchLower) return true;
         return (
            p.action.toLowerCase().includes(searchLower) ||
            p.resource.toLowerCase().includes(searchLower) ||
            (p.description?.toLowerCase().includes(searchLower) ?? false)
         );
      });
   }, [permissions, resourceFilter, searchTerm]);

   const hasActiveFilter = resourceFilter !== "all" || searchTerm.trim() !== "";

   // Ações já existentes no sistema, oferecidas como chips de preenchimento
   // rápido ao cadastrar/editar uma permissão
   const actionSuggestions = useMemo(() => {
      const unique = [...new Set(permissions.map((p) => p.action))];
      return unique.sort(compareActions);
   }, [permissions]);

   // Modal handlers
   const handleOpenCreateModal = () => {
      setEditingPermission(null);
      setShowFormModal(true);
   };

   const handleOpenEditModal = (permission: PermissionDetail) => {
      setEditingPermission(permission);
      setShowFormModal(true);
   };

   const handleOpenDeleteModal = (permission: PermissionDetail) => {
      setDeletingPermission(permission);
      setShowDeleteModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingPermission(null);
   };

   const handleCloseDeleteModal = () => {
      setShowDeleteModal(false);
      setDeletingPermission(null);
   };

   // Mutation handlers
   const handleSubmit = async (data: {
      resource_id: number;
      name: string;
      description: string;
   }) => {
      try {
         if (editingPermission) {
            const updateData: PermissionUpdate = {
               name: data.name,
               description: data.description,
            };

            const result = await updateMutation.mutateAsync({
               id: editingPermission.id,
               data: updateData,
            });

            if (result.ok) {
               push({
                  type: "success",
                  message: "Permissão atualizada com sucesso",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao atualizar permissão",
               });
            }
         } else {
            const createData: PermissionCreate = {
               resource_id: data.resource_id,
               name: data.name,
               description: data.description,
            };

            const result = await createMutation.mutateAsync(createData);

            if (result.ok) {
               push({
                  type: "success",
                  message: "Permissão criada com sucesso",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao criar permissão",
               });
            }
         }
      } catch (error) {
         console.error("submitPermission failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const handleDelete = async () => {
      if (!deletingPermission) return;

      try {
         const result = await deleteMutation.mutateAsync(deletingPermission.id);

         if (result.ok) {
            push({
               type: "success",
               message: "Permissão excluída com sucesso",
            });
            handleCloseDeleteModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao excluir permissão",
            });
         }
      } catch (error) {
         console.error("deletePermission failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const isLoading = isLoadingPermissions || isLoadingResources;
   const hasError = Boolean(permissionsError || resourcesError);
   const isFetching = isFetchingPermissions || isFetchingResources;

   // Erro sem dado em tela: a mensagem que o backend mandou, não um genérico.
   // A tabela depende das duas listas (o filtro usa os recursos)
   const blockingError =
      (!permissionsData && permissionsError) ||
      (!resourcesData && resourcesError) ||
      null;
   const ready = !isLoading && !blockingError;

   const handleRetry = () => {
      // Só refaz o que falhou: a query que já deu certo não precisa voltar
      if (permissionsError) refetchPermissions();
      if (resourcesError) refetchResources();
   };

   const filterControls = (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
         <TextInput
            id="permission-search"
            type="text"
            icon={FaMagnifyingGlass}
            placeholder="Buscar permissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!ready}
            className="w-full sm:w-48"
            aria-label="Buscar permissões"
         />
         <div className="flex items-center gap-2">
            <FaFilter
               className="h-3.5 w-3.5 text-gray-400"
               aria-hidden="true"
            />
            <Select
               id="resource-filter"
               value={resourceFilter}
               onChange={(e) => setResourceFilter(e.target.value)}
               disabled={!ready}
               className="w-full sm:w-56"
               aria-label="Filtrar por recurso"
            >
               <option value="all">Todos os recursos</option>
               {resources.map((resource) => (
                  <option key={resource.id} value={resource.name}>
                     {resource.name}
                  </option>
               ))}
            </Select>
         </div>
      </div>
   );

   return (
      <div className="space-y-4">
         {/* Casca imediata: título e filtros montam já; contagem e "Nova
             Permissão" esperam o dado (o formulário precisa dos recursos) */}
         <SectionHeader
            title="Permissões"
            count={ready ? filteredPermissions.length : undefined}
            countLabel={
               filteredPermissions.length === 1 ? "permissão" : "permissões"
            }
            onCreateClick={ready ? handleOpenCreateModal : undefined}
            createLabel="Nova Permissão"
            createButtonColor="dark"
         >
            {filterControls}
         </SectionHeader>

         {isLoading ? (
            <PermissionsTableSkeleton rows={8} />
         ) : blockingError ? (
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm font-medium text-red-800">
                  Não foi possível carregar as permissões.
               </p>
               <p className="text-sm text-red-700">{blockingError.message}</p>
               <Button
                  color="light"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : (
            <>
               {/* Refetch que falhou com dado em tela: mantém a tabela e avisa */}
               {hasError && (
                  <p
                     role="status"
                     className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                  >
                     <span className="min-w-0 flex-1 truncate">
                        Não foi possível atualizar as permissões
                     </span>
                     <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isFetching}
                        className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                     >
                        Tentar novamente
                     </button>
                  </p>
               )}
               {filteredPermissions.length === 0 ? (
                  <EmptyState
                     icon={FaKey}
                     title={
                        hasActiveFilter
                           ? "Nenhuma permissão encontrada"
                           : "Nenhuma permissão cadastrada"
                     }
                     description={
                        hasActiveFilter
                           ? "Nenhum resultado corresponde ao filtro ou busca atuais"
                           : "Crie uma permissão para começar a definir o controle de acesso"
                     }
                     action={
                        hasActiveFilter ? (
                           <button
                              type="button"
                              onClick={() => {
                                 setSearchTerm("");
                                 setResourceFilter("all");
                              }}
                              className="text-sm text-blue-600 hover:underline"
                           >
                              Limpar filtros
                           </button>
                        ) : undefined
                     }
                  />
               ) : (
                  <PermissionsTable
                     permissions={filteredPermissions}
                     onEdit={handleOpenEditModal}
                     onDelete={handleOpenDeleteModal}
                  />
               )}
            </>
         )}

         <PermissionFormModal
            show={showFormModal}
            editingPermission={editingPermission}
            resources={resources}
            actionSuggestions={actionSuggestions}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={handleCloseFormModal}
            onSubmit={handleSubmit}
         />

         <ConfirmModal
            show={showDeleteModal}
            title="Excluir permissão?"
            description={
               deletingPermission
                  ? `A permissão "${deletingPermission.resource}.${deletingPermission.action}" será removida permanentemente. Esta ação não pode ser desfeita.`
                  : undefined
            }
            isLoading={deleteMutation.isPending}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDelete}
            confirmButtonText="Sim, excluir"
         />
      </div>
   );
}
