"use client";

import { useMemo, useState } from "react";
import { TextInput } from "flowbite-react";
import { FaCubes, FaMagnifyingGlass } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useResources,
   useCreateResource,
   useUpdateResource,
   useDeleteResource,
} from "@/hooks/queries";
import type {
   Resource,
   ResourceCreate,
   ResourceUpdate,
} from "services/routes/security/resources";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ResourceFormModal } from "./ResourceFormModal";
import { ResourcesTable, ResourcesTableSkeleton } from "./ResourcesTable";

export default function ResourcesTab() {
   const { push } = useToast();

   // Query hooks
   const { data: resources = [], isLoading, error } = useResources();
   const createMutation = useCreateResource();
   const updateMutation = useUpdateResource();
   const deleteMutation = useDeleteResource();

   // Modal state
   const [showFormModal, setShowFormModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [editingResource, setEditingResource] = useState<Resource | null>(
      null
   );
   const [deletingResource, setDeletingResource] = useState<Resource | null>(
      null
   );
   const [searchTerm, setSearchTerm] = useState("");

   const filteredResources = useMemo(() => {
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return resources;
      return resources.filter(
         (resource) =>
            resource.name.toLowerCase().includes(searchLower) ||
            (resource.description?.toLowerCase().includes(searchLower) ??
               false) ||
            resource.id.toString() === searchLower
      );
   }, [resources, searchTerm]);

   // Modal handlers
   const handleOpenCreateModal = () => {
      setEditingResource(null);
      setShowFormModal(true);
   };

   const handleOpenEditModal = (resource: Resource) => {
      setEditingResource(resource);
      setShowFormModal(true);
   };

   const handleOpenDeleteModal = (resource: Resource) => {
      setDeletingResource(resource);
      setShowDeleteModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingResource(null);
   };

   const handleCloseDeleteModal = () => {
      setShowDeleteModal(false);
      setDeletingResource(null);
   };

   // Mutation handlers
   const handleSubmit = async (data: { name: string; description: string }) => {
      try {
         if (editingResource) {
            const result = await updateMutation.mutateAsync({
               id: editingResource.id,
               data: data as ResourceUpdate,
            });

            if (result.ok) {
               push({
                  type: "success",
                  message: result.message || "Recurso atualizado com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao atualizar recurso",
               });
            }
         } else {
            const result = await createMutation.mutateAsync(
               data as ResourceCreate
            );

            if (result.ok) {
               push({
                  type: "success",
                  message: result.message || "Recurso criado com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao criar recurso",
               });
            }
         }
      } catch (error) {
         console.error("submitResource failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const handleDelete = async () => {
      if (!deletingResource) return;

      try {
         const result = await deleteMutation.mutateAsync(deletingResource.id);

         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Recurso excluido com sucesso!",
            });
            handleCloseDeleteModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao excluir recurso",
            });
         }
      } catch (error) {
         console.error("deleteResource failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Recursos" />
            <ResourcesTableSkeleton rows={8} />
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
               Erro ao carregar recursos. Por favor, tente novamente.
            </p>
         </div>
      );
   }

   const hasSearch = searchTerm.trim() !== "";

   const searchControl = (
      <TextInput
         id="resource-search"
         type="text"
         icon={FaMagnifyingGlass}
         placeholder="Buscar recursos..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="w-full sm:w-64"
         aria-label="Buscar recursos"
      />
   );

   return (
      <div className="space-y-4">
         <SectionHeader
            title="Recursos"
            count={filteredResources.length}
            countLabel={filteredResources.length === 1 ? "recurso" : "recursos"}
            onCreateClick={handleOpenCreateModal}
            createLabel="Novo Recurso"
         >
            {searchControl}
         </SectionHeader>

         {filteredResources.length === 0 ? (
            <EmptyState
               icon={FaCubes}
               title={
                  hasSearch
                     ? "Nenhum recurso encontrado"
                     : "Nenhum recurso cadastrado"
               }
               description={
                  hasSearch
                     ? `Nao encontramos resultados para "${searchTerm}"`
                     : "Crie um recurso para comecar a gerenciar permissoes"
               }
               action={
                  hasSearch ? (
                     <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="text-sm text-blue-600 hover:underline"
                     >
                        Limpar busca
                     </button>
                  ) : undefined
               }
            />
         ) : (
            <ResourcesTable
               resources={filteredResources}
               onEdit={handleOpenEditModal}
               onDelete={handleOpenDeleteModal}
            />
         )}

         <ResourceFormModal
            show={showFormModal}
            editingResource={editingResource}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={handleCloseFormModal}
            onSubmit={handleSubmit}
         />

         <ConfirmModal
            show={showDeleteModal}
            title="Excluir recurso?"
            description={
               deletingResource
                  ? `O recurso "${deletingResource.name}" sera removido permanentemente. Esta acao nao pode ser desfeita.`
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
