"use client";

import { useState } from "react";
import { useToast } from "@/app/context/toast";
import {
   useFuncoesCatalogo,
   useCreateFuncao,
   useUpdateFuncao,
   useDeleteFuncao,
   useSetFuncaoPosicoes,
} from "@/hooks/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { FaUserGroup, FaTriangleExclamation } from "react-icons/fa6";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type {
   Funcao,
   FuncaoPosicaoInput,
   FuncaoUpsert,
} from "services/routes/funcs";
import { FuncoesHeader } from "./components/FuncoesHeader";
import { FuncoesTable, FuncoesTableSkeleton } from "./components/FuncoesTable";
import { FuncaoFormModal } from "./components/FuncaoFormModal";
import { PosicoesModal } from "./components/PosicoesModal";

/**
 * Catálogo de funções de tripulante (control-plane de sistema).
 *
 * Cada unidade escolhe em /config quais dessas funções opera — aqui só se
 * mantém o catálogo comum: código, rótulo, cor e posições a bordo.
 */
export default function AdminFuncoesPage() {
   const { push } = useToast();

   const { data: funcoes = [], isLoading, error } = useFuncoesCatalogo(true);
   const createMutation = useCreateFuncao();
   const updateMutation = useUpdateFuncao();
   const deleteMutation = useDeleteFuncao();
   const posicoesMutation = useSetFuncaoPosicoes();

   const [showForm, setShowForm] = useState(false);
   const [editando, setEditando] = useState<Funcao | null>(null);
   const [posicoesDe, setPosicoesDe] = useState<Funcao | null>(null);
   const [excluindo, setExcluindo] = useState<Funcao | null>(null);

   const isBusy =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      posicoesMutation.isPending;

   function erro(err: unknown, fallback: string) {
      push({
         type: "error",
         message: err instanceof Error ? err.message : fallback,
      });
   }

   async function handleSubmit(data: FuncaoUpsert & { cod: string }) {
      const { cod, ...resto } = data;
      try {
         if (editando) {
            await updateMutation.mutateAsync({ cod, data: resto });
            push({ type: "success", message: "Função atualizada" });
         } else {
            await createMutation.mutateAsync(data);
            push({ type: "success", message: "Função cadastrada" });
         }
         setShowForm(false);
         setEditando(null);
      } catch (err) {
         erro(err, "Erro ao salvar a função");
      }
   }

   async function handlePosicoes(posicoes: FuncaoPosicaoInput[]) {
      if (!posicoesDe) return;
      try {
         await posicoesMutation.mutateAsync({
            cod: posicoesDe.cod,
            posicoes,
         });
         push({ type: "success", message: "Posições a bordo atualizadas" });
         setPosicoesDe(null);
      } catch (err) {
         erro(err, "Erro ao salvar as posições");
      }
   }

   async function handleDelete() {
      if (!excluindo) return;
      try {
         await deleteMutation.mutateAsync(excluindo.cod);
         push({ type: "success", message: "Função removida" });
         setExcluindo(null);
      } catch (err) {
         erro(err, "Erro ao remover a função");
      }
   }

   return (
      <div className="space-y-2">
         <FuncoesHeader
            count={isLoading ? undefined : funcoes.length}
            onCreate={() => {
               setEditando(null);
               setShowForm(true);
            }}
         />

         {isLoading ? (
            <FuncoesTableSkeleton />
         ) : error ? (
            <EmptyState
               icon={FaTriangleExclamation}
               title="Erro ao carregar o catálogo"
               description={
                  error instanceof Error ? error.message : "Tente novamente"
               }
            />
         ) : funcoes.length === 0 ? (
            <EmptyState
               icon={FaUserGroup}
               title="Nenhuma função cadastrada"
               description="Cadastre as funções que as unidades podem operar."
            />
         ) : (
            <FuncoesTable
               funcoes={funcoes}
               isBusy={isBusy}
               onEdit={(funcao) => {
                  setEditando(funcao);
                  setShowForm(true);
               }}
               onPosicoes={setPosicoesDe}
               onDelete={setExcluindo}
            />
         )}

         <FuncaoFormModal
            show={showForm}
            funcao={editando}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={() => {
               setShowForm(false);
               setEditando(null);
            }}
            onSubmit={handleSubmit}
         />

         <PosicoesModal
            show={posicoesDe !== null}
            funcao={posicoesDe}
            isSaving={posicoesMutation.isPending}
            onClose={() => setPosicoesDe(null)}
            onSubmit={handlePosicoes}
         />

         <ConfirmModal
            show={excluindo !== null}
            title={`Remover a função ${excluindo?.nome ?? ""}?`}
            description="Função em uso por tripulante ou unidade não é removida — nesse caso, desative-a."
            isLoading={deleteMutation.isPending}
            onClose={() => setExcluindo(null)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
         />
      </div>
   );
}
