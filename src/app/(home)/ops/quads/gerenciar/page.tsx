"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "flowbite-react";
import { FaArrowLeft, FaPlus, FaLayerGroup, FaSliders } from "react-icons/fa6";
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
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { QuadsGroupCard } from "./components/QuadsGroupCard";
import { QuadsGerenciarSkeleton } from "./components/QuadsGerenciarSkeleton";
import {
   ShortLongFormModal,
   type ShortLongData,
} from "./components/ShortLongFormModal";
import { TypeFuncsModal } from "./components/TypeFuncsModal";

export default function GerenciarQuadsPage() {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const canManage = hasPerm("ops.quadrinhos", "create");

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

   // Referência estável: o modal re-sincroniza o formulário quando `initial`
   // muda, e um objeto novo a cada render apagaria a edição em curso (o
   // `isPending` do salvar re-renderiza a página).
   const groupInitial = useMemo<ShortLongData | null>(
      () =>
         groupModal.editing
            ? { short: groupModal.editing.short, long: groupModal.editing.long }
            : null,
      [groupModal.editing]
   );
   const typeInitial = useMemo<ShortLongData | null>(
      () =>
         typeModal.editing
            ? { short: typeModal.editing.short, long: typeModal.editing.long }
            : null,
      [typeModal.editing]
   );

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

   if (!canManage) {
      return <PermDenied />;
   }

   const isSavingGroup = createGroup.isPending || updateGroup.isPending;
   const isSavingType = createType.isPending || updateType.isPending;

   return (
      <div className="space-y-2">
         {/* Masthead — referência canônica (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <FaSliders className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Quadrinhos
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Gerenciar
                     </h1>
                  </div>
               </div>

               {/* No celular só o ícone: o rótulo vira `sr-only` e segue como
                   nome acessível, sem empurrar as ações para outra linha. */}
               <div className="flex shrink-0 items-center gap-2">
                  <Button as={Link} href="/ops/quads" color="light">
                     <FaArrowLeft className="h-3 w-3 sm:mr-2" />
                     <span className="sr-only sm:not-sr-only">Voltar</span>
                  </Button>
                  <Button
                     color="primary"
                     className="font-semibold whitespace-nowrap"
                     onClick={() =>
                        setGroupModal({ open: true, editing: null })
                     }
                  >
                     <FaPlus className="h-4 w-4 sm:mr-2" />
                     <span className="sr-only sm:not-sr-only">Novo grupo</span>
                  </Button>
               </div>
            </div>
         </header>

         {isLoading ? (
            <QuadsGerenciarSkeleton />
         ) : error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-red-300 bg-red-50 p-4">
               <p className="text-sm text-red-800">
                  Erro ao carregar quadrinhos. Por favor, tente novamente.
               </p>
               <Button color="light" size="sm" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         ) : groups.length === 0 ? (
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
                     onDeleteGroup={(g) => {
                        // O backend recusa (409) grupo com tipos; avisar já
                        // poupa o usuário de confirmar para então falhar.
                        if (g.types.length > 0) {
                           push({
                              type: "error",
                              message: `Remova os ${g.types.length} tipo(s) do grupo antes de excluí-lo.`,
                           });
                           return;
                        }
                        setDeletingGroup(g);
                     }}
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
            initial={groupInitial}
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
            initial={typeInitial}
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
