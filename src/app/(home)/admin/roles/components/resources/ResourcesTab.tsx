"use client";

import { useMemo, useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { FaCubes, FaMagnifyingGlass } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useResources,
   usePermissions,
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
   const {
      data: resourcesData,
      isLoading,
      isFetching,
      error,
      refetch,
   } = useResources();
   // Query secundária (só alimenta a coluna "Permissões"): a falha dela não
   // derruba a tabela, mas precisa ser dita — senão o skeleton da coluna fica
   // preso para sempre
   const {
      data: permissions,
      isError: permissionsError,
      isFetching: isFetchingPermissions,
      refetch: refetchPermissions,
   } = usePermissions();
   const resources = useMemo(() => resourcesData ?? [], [resourcesData]);
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

   const permissionCounts = useMemo(() => {
      if (!permissions) return undefined;
      const counts = new Map<string, number>();
      permissions.forEach((p) => {
         counts.set(p.resource, (counts.get(p.resource) ?? 0) + 1);
      });
      return counts;
   }, [permissions]);

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
               message: result.message || "Recurso excluído com sucesso!",
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

   // Erro sem dado em tela: a mensagem que o backend mandou, não um genérico
   const blockingError = resourcesData ? null : error;
   const ready = !isLoading && !blockingError;

   const hasSearch = searchTerm.trim() !== "";

   const searchControl = (
      <TextInput
         id="resource-search"
         type="text"
         icon={FaMagnifyingGlass}
         placeholder="Buscar recursos..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         disabled={!ready}
         className="w-full sm:w-64"
         aria-label="Buscar recursos"
      />
   );

   return (
      <div className="space-y-4">
         {/* Casca imediata: título e busca montam já; contagem e "Novo
             Recurso" esperam o dado */}
         <SectionHeader
            title="Recursos"
            count={ready ? filteredResources.length : undefined}
            countLabel={filteredResources.length === 1 ? "recurso" : "recursos"}
            onCreateClick={ready ? handleOpenCreateModal : undefined}
            createLabel="Novo Recurso"
            createButtonColor="dark"
         >
            {searchControl}
         </SectionHeader>

         {isLoading ? (
            <ResourcesTableSkeleton rows={8} />
         ) : blockingError ? (
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm font-medium text-red-800">
                  Não foi possível carregar os recursos.
               </p>
               <p className="text-sm text-red-700">{blockingError.message}</p>
               <Button
                  color="light"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : (
            <>
               {/* Falha de refetch (recursos) ou da contagem de permissões:
                   a tabela fica e o aviso é discreto */}
               {(error || permissionsError) && (
                  <p
                     role="status"
                     className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
                  >
                     <span className="min-w-0 flex-1 truncate">
                        {error
                           ? "Não foi possível atualizar os recursos"
                           : "Não foi possível carregar a contagem de permissões"}
                     </span>
                     <button
                        type="button"
                        onClick={() => {
                           if (error) refetch();
                           if (permissionsError) refetchPermissions();
                        }}
                        disabled={isFetching || isFetchingPermissions}
                        className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
                     >
                        Tentar novamente
                     </button>
                  </p>
               )}
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
                           ? `Não encontramos resultados para "${searchTerm}"`
                           : "Crie um recurso para começar a gerenciar permissões"
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
                     permissionCounts={permissionCounts}
                     permissionCountsError={permissionsError}
                     onEdit={handleOpenEditModal}
                     onDelete={handleOpenDeleteModal}
                  />
               )}
            </>
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
                  ? `O recurso "${deletingResource.name}" será removido permanentemente. Esta ação não pode ser desfeita.`
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
