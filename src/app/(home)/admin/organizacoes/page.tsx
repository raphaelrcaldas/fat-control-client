"use client";

import { useMemo, useState } from "react";
import { TextInput } from "flowbite-react";
import { FaBuilding, FaMagnifyingGlass } from "react-icons/fa6";
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
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { OrganizacaoFormModal } from "./components/OrganizacaoFormModal";
import { OrganizacoesTable } from "./components/OrganizacoesTable";

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
   const [searchTerm, setSearchTerm] = useState("");

   const filteredOrgs = useMemo(() => {
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return organizacoes;
      return organizacoes.filter(
         (org) =>
            org.sigla.toLowerCase().includes(searchLower) ||
            (org.sigla_2?.toLowerCase().includes(searchLower) ?? false) ||
            (org.sigla_3?.toLowerCase().includes(searchLower) ?? false) ||
            org.nome.toLowerCase().includes(searchLower) ||
            (org.alias?.toLowerCase().includes(searchLower) ?? false)
      );
   }, [organizacoes, searchTerm]);

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
         <div className="px-2 py-8">
            <TableSkeleton rows={8} cols={5} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
               Erro ao carregar organizações. Por favor, tente novamente.
            </p>
         </div>
      );
   }

   const hasSearch = searchTerm.trim() !== "";

   const searchControl = (
      <TextInput
         id="org-search"
         type="text"
         icon={FaMagnifyingGlass}
         placeholder="Buscar organizações..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="w-full sm:w-64"
         aria-label="Buscar organizações"
      />
   );

   return (
      <div className="grid gap-4 p-2">
         <SectionHeader
            title="Organizações"
            count={filteredOrgs.length}
            countLabel={
               filteredOrgs.length === 1 ? "organização" : "organizações"
            }
            onCreateClick={handleOpenCreateModal}
            createLabel="Nova Organização"
         >
            {searchControl}
         </SectionHeader>

         {filteredOrgs.length === 0 ? (
            <EmptyState
               icon={FaBuilding}
               title={
                  hasSearch
                     ? "Nenhuma organização encontrada"
                     : "Nenhuma organização cadastrada"
               }
               description={
                  hasSearch
                     ? `Não encontramos resultados para "${searchTerm}"`
                     : "Cadastre uma organização para começar"
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
            <OrganizacoesTable
               organizacoes={filteredOrgs}
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
