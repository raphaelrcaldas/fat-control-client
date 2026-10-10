"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { MdOutlineCategory } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import {
   useTiposMissao,
   useCreateTipoMissao,
   useUpdateTipoMissao,
   useDeleteTipoMissao,
} from "@/hooks/queries/useTiposMissao";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { TipoMissaoPublic } from "services/routes/estatistica/tiposMissao";
import type { TipoMissaoFormData } from "./schemas/tipoMissaoSchema";
import { TiposMissaoHeader } from "./components/TiposMissaoHeader";
import {
   TiposMissaoTable,
   TiposMissaoTableSkeleton,
} from "./components/TiposMissaoTable";
import { TipoMissaoFormModal } from "./components/TipoMissaoFormModal";

/**
 * Tipos de missão (control-plane de sistema).
 *
 * Tabela global, sem organização: o código classifica as etapas de todas as
 * unidades e alimenta editor de etapa, simulador, filtros e indicadores.
 */
export default function AdminTiposMissaoPage() {
   const { push } = useToast();

   const {
      data: tiposData,
      isLoading,
      isFetching,
      error,
      refetch,
   } = useTiposMissao();
   const tipos = tiposData ?? [];
   const createMutation = useCreateTipoMissao();
   const updateMutation = useUpdateTipoMissao();
   const deleteMutation = useDeleteTipoMissao();

   const [showForm, setShowForm] = useState(false);
   const [editando, setEditando] = useState<TipoMissaoPublic | null>(null);
   const [excluindo, setExcluindo] = useState<TipoMissaoPublic | null>(null);

   const isSaving = createMutation.isPending || updateMutation.isPending;
   const isBusy = isSaving || deleteMutation.isPending;

   function fecharForm() {
      setShowForm(false);
      setEditando(null);
   }

   /** Rejeita em falha: o modal mostra o erro e mantém o formulário aberto. */
   async function handleSubmit(data: TipoMissaoFormData) {
      if (editando) {
         // PUT parcial: só o que mudou viaja.
         const mudancas = {
            ...(data.cod !== editando.cod && { cod: data.cod }),
            ...(data.desc !== editando.desc && { desc: data.desc }),
         };
         // Só espaço nas pontas deixa o form "sujo", mas o zod apara: não há
         // o que enviar.
         if (Object.keys(mudancas).length === 0) {
            fecharForm();
            return;
         }
         await updateMutation.mutateAsync({ id: editando.id, data: mudancas });
         push({ type: "success", message: "Tipo de missão atualizado" });
      } else {
         await createMutation.mutateAsync(data);
         push({ type: "success", message: "Tipo de missão cadastrado" });
      }
      fecharForm();
   }

   async function handleDelete() {
      if (!excluindo) return;
      try {
         await deleteMutation.mutateAsync(excluindo.id);
         push({ type: "success", message: "Tipo de missão removido" });
         setExcluindo(null);
      } catch (err) {
         // 409 "em uso por etapas" vem pronto do backend — não replicamos a
         // regra aqui.
         push({
            type: "error",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao remover o tipo de missão",
         });
      }
   }

   return (
      <div className="space-y-2">
         <TiposMissaoHeader
            count={
               isLoading || (error && !tiposData) ? undefined : tipos.length
            }
            onCreate={() => {
               setEditando(null);
               setShowForm(true);
            }}
         />

         {/* Refetch que falhou com a lista em tela: mantém e avisa */}
         {error && tiposData && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar os tipos de missão
               </span>
               <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}

         {isLoading ? (
            <TiposMissaoTableSkeleton />
         ) : error && !tiposData ? (
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  Erro ao carregar os tipos de missão.
                  {error instanceof Error && error.message
                     ? ` ${error.message}`
                     : " Por favor, tente novamente."}
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
         ) : tipos.length === 0 ? (
            <EmptyState
               icon={MdOutlineCategory}
               title="Nenhum tipo de missão cadastrado"
               description="Cadastre os tipos usados para classificar as etapas."
            />
         ) : (
            <TiposMissaoTable
               tipos={tipos}
               isBusy={isBusy}
               onEdit={(tipo) => {
                  setEditando(tipo);
                  setShowForm(true);
               }}
               onDelete={setExcluindo}
            />
         )}

         <TipoMissaoFormModal
            show={showForm}
            tipo={editando}
            isSaving={isSaving}
            onClose={fecharForm}
            onSubmit={handleSubmit}
         />

         <ConfirmModal
            show={excluindo !== null}
            title={`Remover o tipo ${excluindo?.cod ?? ""}?`}
            description={
               <>
                  <span className="block font-medium text-slate-700">
                     {excluindo?.desc}
                  </span>
                  Tipo em uso por etapas não é removido.
               </>
            }
            isLoading={deleteMutation.isPending}
            onClose={() => setExcluindo(null)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
         />
      </div>
   );
}
