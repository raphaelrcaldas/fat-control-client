"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { FaBuilding, FaPlus } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useOrganizacoes,
   useCreateOrganizacao,
   useUpdateOrganizacao,
   useDeleteOrganizacao,
} from "@/hooks/queries";
import type { Organizacao } from "services/routes/organizacoes";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useIsSystemAdmin } from "../../hooks/useSystemAdmin";
import { OrganizacoesHeader } from "./components/OrganizacoesHeader";
import { OrganizacaoFormModal } from "./components/OrganizacaoFormModal";
import {
   OrganizacoesTable,
   OrganizacoesTableSkeleton,
} from "./components/OrganizacoesTable";
import { formatOrganizacaoSaveError } from "./organizacaoErrors";
import {
   toOrganizacaoPayload,
   type OrganizacaoFormData,
} from "./schemas/organizacaoSchema";

export default function OrganizacoesPage() {
   const { push } = useToast();

   // Writes do router são require_system_admin: fora do contexto Sistema o
   // backend responde 403 SCOPE_FORBIDDEN, que redireciona para /403 e
   // descartaria o formulário. Então nem oferecemos a ação.
   const canManage = useIsSystemAdmin();

   const {
      data: organizacoes = [],
      isLoading,
      isFetching,
      error,
      refetch,
   } = useOrganizacoes();
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

   /** Deixa o erro subir: o modal devolve os erros de campo aos inputs. */
   const handleSubmit = async (data: OrganizacaoFormData) => {
      const payload = toOrganizacaoPayload(data);

      // Na edição a sigla é imutável (input disabled) — fica fora do PUT para
      // não reenviar a PK como se fosse alteração.
      const { sigla: _sigla, ...updatePayload } = payload;

      const result = editingOrg
         ? await updateMutation.mutateAsync({
              sigla: editingOrg.sigla,
              data: updatePayload,
           })
         : await createMutation.mutateAsync(payload);

      push({
         type: "success",
         message:
            result.message ||
            (editingOrg
               ? "Organização atualizada com sucesso!"
               : "Organização criada com sucesso!"),
      });
      handleCloseFormModal();
   };

   const handleDelete = async () => {
      if (!deletingOrg) return;

      try {
         const result = await deleteMutation.mutateAsync(deletingOrg.sigla);
         push({
            type: "success",
            message: result.message || "Organização excluída com sucesso!",
         });
         handleCloseDeleteModal();
      } catch (err: unknown) {
         push({
            type: "error",
            message: formatOrganizacaoSaveError(
               err,
               "Erro ao excluir organização"
            ),
         });
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-2">
            <OrganizacoesHeader
               canManage={canManage}
               onCreate={handleOpenCreateModal}
            />
            <OrganizacoesTableSkeleton rows={8} canManage={canManage} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-2">
            <OrganizacoesHeader
               canManage={canManage}
               onCreate={handleOpenCreateModal}
            />
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  Erro ao carregar organizações. Por favor, tente novamente.
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
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <OrganizacoesHeader
            count={organizacoes.length}
            canManage={canManage}
            onCreate={handleOpenCreateModal}
         />

         {organizacoes.length === 0 ? (
            <EmptyState
               icon={FaBuilding}
               title="Nenhuma organização cadastrada"
               description={
                  canManage
                     ? "Cadastre uma organização para começar"
                     : "Só um admin de sistema pode cadastrar organizações"
               }
               action={
                  canManage && (
                     <Button color="light" onClick={handleOpenCreateModal}>
                        <FaPlus className="mr-2 h-4 w-4" />
                        Nova Organização
                     </Button>
                  )
               }
            />
         ) : (
            <OrganizacoesTable
               organizacoes={organizacoes}
               canManage={canManage}
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
