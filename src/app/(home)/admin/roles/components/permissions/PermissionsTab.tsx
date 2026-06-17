"use client";

import { useMemo, useState } from "react";
import { Select, TextInput } from "flowbite-react";
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
   const { data: permissions = [], isLoading: isLoadingPermissions } =
      usePermissions();
   const {
      data: resources = [],
      isLoading: isLoadingResources,
      error,
   } = useResources();

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

   // Loading state
   if (isLoadingPermissions || isLoadingResources) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Permissões" />
            <PermissionsTableSkeleton rows={8} />
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="rounded border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">
               Erro ao carregar permissões. Por favor, tente novamente.
            </p>
         </div>
      );
   }

   const filterControls = (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
         <TextInput
            id="permission-search"
            type="text"
            icon={FaMagnifyingGlass}
            placeholder="Buscar permissões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
         <SectionHeader
            title="Permissões"
            count={filteredPermissions.length}
            countLabel={
               filteredPermissions.length === 1 ? "permissão" : "permissões"
            }
            onCreateClick={handleOpenCreateModal}
            createLabel="Nova Permissão"
         >
            {filterControls}
         </SectionHeader>

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
