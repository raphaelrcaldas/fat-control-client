"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "flowbite-react";
import { FaArrowLeft, FaPlus, FaLayerGroup } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import PermDenied from "@/app/components/permDenied";
import { usePermBased } from "../../../hooks/usePermBased";
import {
   useQuadsTypes,
   useCreateQuadsGroup,
   useUpdateQuadsGroup,
   useDeleteQuadsGroup,
   useCreateQuadsType,
   useUpdateQuadsType,
   useDeleteQuadsType,
   useSetQuadsTypeFuncs,
} from "@/hooks/queries";
import type { QuadType, QuadTypeGroup } from "services/routes/quads";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { QuadsGroupCard } from "./components/QuadsGroupCard";
import {
   ShortLongFormModal,
   type ShortLongData,
} from "./components/ShortLongFormModal";
import { TypeFuncsModal } from "./components/TypeFuncsModal";

export default function GerenciarQuadsPage() {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const canManage = hasPerm("quad_ops", "create");

   const { data: groups = [], isLoading, error, refetch } = useQuadsTypes();

   const createGroup = useCreateQuadsGroup();
   const updateGroup = useUpdateQuadsGroup();
   const deleteGroup = useDeleteQuadsGroup();
   const createType = useCreateQuadsType();
   const updateType = useUpdateQuadsType();
   const deleteType = useDeleteQuadsType();
   const setFuncs = useSetQuadsTypeFuncs();

   // Estado dos modais
   const [groupModal, setGroupModal] = useState<{
      open: boolean;
      editing: QuadTypeGroup | null;
   }>({ open: false, editing: null });
   const [typeModal, setTypeModal] = useState<{
      open: boolean;
      group: QuadTypeGroup | null;
      editing: QuadType | null;
   }>({ open: false, group: null, editing: null });
   const [funcsModal, setFuncsModal] = useState<{
      open: boolean;
      type: QuadType | null;
   }>({ open: false, type: null });
   const [deletingGroup, setDeletingGroup] = useState<QuadTypeGroup | null>(
      null
   );
   const [deletingType, setDeletingType] = useState<QuadType | null>(null);

   const notify = (
      ok: boolean,
      message: string | undefined,
      fallback: string
   ) => push({ type: ok ? "success" : "error", message: message || fallback });

   // ---- Grupo ----
   const handleSubmitGroup = async (data: ShortLongData) => {
      try {
         if (groupModal.editing) {
            const res = await updateGroup.mutateAsync({
               groupId: groupModal.editing.id,
               data,
            });
            notify(res.ok, res.message, "Grupo atualizado com sucesso!");
            if (res.ok) setGroupModal({ open: false, editing: null });
         } else {
            const res = await createGroup.mutateAsync(data);
            notify(res.ok, res.message, "Grupo criado com sucesso!");
            if (res.ok) setGroupModal({ open: false, editing: null });
         }
      } catch (e) {
         console.error("submitGroup failed", e);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const handleDeleteGroup = async () => {
      if (!deletingGroup) return;
      try {
         const res = await deleteGroup.mutateAsync(deletingGroup.id);
         notify(res.ok, res.message, "Grupo excluído com sucesso!");
         if (res.ok) setDeletingGroup(null);
      } catch (e) {
         console.error("deleteGroup failed", e);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   // ---- Tipo ----
   const handleSubmitType = async (data: ShortLongData) => {
      if (!typeModal.group) return;
      try {
         if (typeModal.editing) {
            const res = await updateType.mutateAsync({
               typeId: typeModal.editing.id,
               data,
            });
            notify(res.ok, res.message, "Tipo atualizado com sucesso!");
            if (res.ok)
               setTypeModal({ open: false, group: null, editing: null });
         } else {
            const res = await createType.mutateAsync({
               groupId: typeModal.group.id,
               data,
            });
            notify(res.ok, res.message, "Tipo criado com sucesso!");
            if (res.ok)
               setTypeModal({ open: false, group: null, editing: null });
         }
      } catch (e) {
         console.error("submitType failed", e);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const handleDeleteType = async () => {
      if (!deletingType) return;
      try {
         const res = await deleteType.mutateAsync(deletingType.id);
         notify(res.ok, res.message, "Tipo excluído com sucesso!");
         if (res.ok) setDeletingType(null);
      } catch (e) {
         console.error("deleteType failed", e);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   // ---- Funções ----
   const handleSubmitFuncs = async (funcs: string[]) => {
      if (!funcsModal.type) return;
      try {
         const res = await setFuncs.mutateAsync({
            typeId: funcsModal.type.id,
            funcs,
         });
         notify(res.ok, res.message, "Funções atualizadas com sucesso!");
         if (res.ok) setFuncsModal({ open: false, type: null });
      } catch (e) {
         console.error("submitFuncs failed", e);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const backLink = (
      <Button as={Link} href="/ops/quads" color="light" size="sm">
         <FaArrowLeft className="mr-2 h-3 w-3" />
         Voltar
      </Button>
   );

   if (!canManage) {
      return <PermDenied />;
   }

   if (isLoading) {
      return <TableSkeleton rows={6} cols={3} />;
   }

   if (error) {
      return (
         <div className="space-y-2">
            {backLink}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-red-300 bg-red-50 p-4">
               <p className="text-sm text-red-800">
                  Erro ao carregar quadrinhos. Por favor, tente novamente.
               </p>
               <Button color="light" size="sm" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         </div>
      );
   }

   const isSavingGroup = createGroup.isPending || updateGroup.isPending;
   const isSavingType = createType.isPending || updateType.isPending;

   return (
      <div className="space-y-2">
         <div className="flex items-center gap-3">{backLink}</div>

         <SectionHeader
            title="Gerenciar quadrinhos"
            headingLevel="h1"
            count={groups.length}
            countLabel={groups.length === 1 ? "grupo" : "grupos"}
            onCreateClick={() => setGroupModal({ open: true, editing: null })}
            createLabel="Novo grupo"
            createIcon={FaPlus}
         />

         {groups.length === 0 ? (
            <EmptyState
               icon={FaLayerGroup}
               title="Nenhum grupo cadastrado"
               description="Cadastre um grupo para começar a estruturar os quadrinhos."
            />
         ) : (
            <div className="space-y-2">
               {groups.map((group) => (
                  <QuadsGroupCard
                     key={group.id}
                     group={group}
                     onEditGroup={(g) =>
                        setGroupModal({ open: true, editing: g })
                     }
                     onDeleteGroup={(g) => setDeletingGroup(g)}
                     onAddType={(g) =>
                        setTypeModal({ open: true, group: g, editing: null })
                     }
                     onEditType={(g, t) =>
                        setTypeModal({ open: true, group: g, editing: t })
                     }
                     onDeleteType={(_g, t) => setDeletingType(t)}
                     onEditFuncs={(_g, t) =>
                        setFuncsModal({ open: true, type: t })
                     }
                  />
               ))}
            </div>
         )}

         <ShortLongFormModal
            show={groupModal.open}
            title={groupModal.editing ? "Editar grupo" : "Novo grupo"}
            shortLabel="Sigla"
            longLabel="Nome"
            shortPlaceholder="Ex: SOBR"
            longPlaceholder="Ex: Sobreaviso"
            initial={
               groupModal.editing
                  ? {
                       short: groupModal.editing.short,
                       long: groupModal.editing.long,
                    }
                  : null
            }
            isSaving={isSavingGroup}
            onClose={() => setGroupModal({ open: false, editing: null })}
            onSubmit={handleSubmitGroup}
         />

         <ShortLongFormModal
            show={typeModal.open}
            title={typeModal.editing ? "Editar tipo" : "Novo tipo"}
            shortLabel="Sigla"
            longLabel="Nome"
            shortPlaceholder="Ex: PTO"
            longPlaceholder="Ex: Sobreaviso preto"
            initial={
               typeModal.editing
                  ? {
                       short: typeModal.editing.short,
                       long: typeModal.editing.long,
                    }
                  : null
            }
            isSaving={isSavingType}
            onClose={() =>
               setTypeModal({ open: false, group: null, editing: null })
            }
            onSubmit={handleSubmitType}
         />

         <TypeFuncsModal
            show={funcsModal.open}
            typeName={funcsModal.type?.long || ""}
            initialFuncs={funcsModal.type?.funcs_list || []}
            isSaving={setFuncs.isPending}
            onClose={() => setFuncsModal({ open: false, type: null })}
            onSubmit={handleSubmitFuncs}
         />

         <ConfirmModal
            show={!!deletingGroup}
            title="Excluir grupo?"
            description={
               deletingGroup
                  ? `O grupo "${deletingGroup.long}" será removido permanentemente.`
                  : undefined
            }
            isLoading={deleteGroup.isPending}
            onClose={() => setDeletingGroup(null)}
            onConfirm={handleDeleteGroup}
            confirmButtonText="Sim, excluir"
         />

         <ConfirmModal
            show={!!deletingType}
            title="Excluir tipo?"
            description={
               deletingType
                  ? `O tipo "${deletingType.long}" será removido permanentemente.`
                  : undefined
            }
            isLoading={deleteType.isPending}
            onClose={() => setDeletingType(null)}
            onConfirm={handleDeleteType}
            confirmButtonText="Sim, excluir"
         />
      </div>
   );
}
