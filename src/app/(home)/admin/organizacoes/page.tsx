"use client";

import { useState } from "react";
import { FaBuilding } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useOrganizacoes,
   useCreateOrganizacao,
   useUpdateOrganizacao,
   useDeleteOrganizacao,
} from "@/hooks/queries";
import type {
   Organizacao,
   OrganizacaoCreate,
} from "services/routes/organizacoes";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { OrganizacoesHeader } from "./components/OrganizacoesHeader";
import { OrganizacaoFormModal } from "./components/OrganizacaoFormModal";
import {
   OrganizacoesTable,
   OrganizacoesTableSkeleton,
} from "./components/OrganizacoesTable";

export default function OrganizacoesPage() {
   const { push } = useToast();

   const { data: organizacoes = [], isLoading, error } = useOrganizacoes();
   const createMutation = useCreateOrganizacao();
   const updateMutation = useUpdateOrganizacao();
   const deleteMutation = useDeleteOrganizacao();

   const [showFormModal, setShowFormModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [editingOrg, setEditingOrg] = useState<Organizacao | null>(null);
   const [deletingOrg, setDeletingOrg] = useState<Organizacao | null>(null);

   const handleOpenCreateModal = () => {
      setEditingOrg(null);
      setShowFormModal(true);
   };

   const handleOpenEditModal = (org: Organizacao) => {
      setEditingOrg(org);
      setShowFormModal(true);
   };

   const handleOpenDeleteModal = (org: Organizacao) => {
      setDeletingOrg(org);
      setShowDeleteModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingOrg(null);
   };

   const handleCloseDeleteModal = () => {
      setShowDeleteModal(false);
      setDeletingOrg(null);
   };

   const handleSubmit = async (data: OrganizacaoCreate) => {
      try {
         if (editingOrg) {
            const result = await updateMutation.mutateAsync({
               sigla: editingOrg.sigla,
               data,
            });

            if (result.ok) {
               push({
                  type: "success",
                  message:
                     result.message || "Organização atualizada com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao atualizar organização",
               });
            }
         } else {
            const result = await createMutation.mutateAsync(data);

            if (result.ok) {
               push({
                  type: "success",
                  message: result.message || "Organização criada com sucesso!",
               });
               handleCloseFormModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao criar organização",
               });
            }
         }
      } catch (error) {
         console.error("submitOrganizacao failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   const handleDelete = async () => {
      if (!deletingOrg) return;

      try {
         const result = await deleteMutation.mutateAsync(deletingOrg.sigla);

         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Organização excluída com sucesso!",
            });
            handleCloseDeleteModal();
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao excluir organização",
            });
         }
      } catch (error) {
         console.error("deleteOrganizacao failed", error);
         push({
            type: "error",
            message: "Ocorreu um erro inesperado",
         });
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-2">
            <OrganizacoesHeader onCreate={handleOpenCreateModal} />
            <OrganizacoesTableSkeleton rows={8} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-2">
            <OrganizacoesHeader onCreate={handleOpenCreateModal} />
            <div className="rounded border border-red-300 bg-red-50 p-4">
               <p className="text-sm text-red-800">
                  Erro ao carregar organizações. Por favor, tente novamente.
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <OrganizacoesHeader
            count={organizacoes.length}
            onCreate={handleOpenCreateModal}
         />

         {organizacoes.length === 0 ? (
            <EmptyState
               icon={FaBuilding}
               title="Nenhuma organização cadastrada"
               description="Cadastre uma organização para começar"
            />
         ) : (
            <OrganizacoesTable
               organizacoes={organizacoes}
               onEdit={handleOpenEditModal}
               onDelete={handleOpenDeleteModal}
            />
         )}

         <OrganizacaoFormModal
            show={showFormModal}
            editingOrg={editingOrg}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={handleCloseFormModal}
            onSubmit={handleSubmit}
         />

         <ConfirmModal
            show={showDeleteModal}
            title="Excluir organização?"
            description={
               deletingOrg
                  ? `A organização "${deletingOrg.sigla}" será removida permanentemente. Esta ação não pode ser desfeita.`
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
