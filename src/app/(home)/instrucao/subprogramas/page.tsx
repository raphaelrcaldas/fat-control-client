"use client";

import { useMemo, useState } from "react";
import {
   FaBookOpen,
   FaMagnifyingGlass,
   FaTriangleExclamation,
} from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useSubprogramas,
   useCreateSubprograma,
   useUpdateSubprograma,
   useDeleteSubprograma,
} from "@/hooks/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type {
   Subprograma,
   SubprogramaUpsert,
} from "services/routes/instrucao/subprogramas";
import { SubprogramasHeader } from "./components/SubprogramasHeader";
import {
   SubprogramasTable,
   SubprogramasTableSkeleton,
} from "./components/SubprogramasTable";
import { SubprogramaFormModal } from "./components/SubprogramaFormModal";
import {
   SubprogramasFilters,
   FILTROS_VAZIOS,
   type SubprogramasFiltersState,
} from "./components/SubprogramasFilters";

/**
 * Cadastro de subprogramas de instrução da unidade.
 *
 * É o catálogo do qual o PAOP monta a relação anual — por isso subprograma
 * já incluído em algum plano não é removido (409 do backend).
 */
export default function SubprogramasPage() {
   const { push } = useToast();

   const { data: subprogramas = [], isLoading, error } = useSubprogramas();
   const createMutation = useCreateSubprograma();
   const updateMutation = useUpdateSubprograma();
   const deleteMutation = useDeleteSubprograma();

   const [showForm, setShowForm] = useState(false);
   const [editando, setEditando] = useState<Subprograma | null>(null);
   const [excluindo, setExcluindo] = useState<Subprograma | null>(null);
   const [filtros, setFiltros] =
      useState<SubprogramasFiltersState>(FILTROS_VAZIOS);

   // Filtro no cliente: a lista já vem inteira e escopada à unidade, então
   // ida ao servidor a cada tecla só adicionaria latência.
   const filtrados = useMemo(() => {
      const busca = filtros.q.trim().toLowerCase();
      return subprogramas.filter(
         (s) =>
            (filtros.tipo === null || s.tipo === filtros.tipo) &&
            (filtros.func === null || s.func === filtros.func) &&
            (busca === "" ||
               s.codigo.toLowerCase().includes(busca) ||
               s.descricao.toLowerCase().includes(busca))
      );
   }, [subprogramas, filtros]);

   const isBusy =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending;

   function erro(err: unknown, fallback: string) {
      push({
         type: "error",
         message: err instanceof Error ? err.message : fallback,
      });
   }

   async function handleSubmit(data: SubprogramaUpsert) {
      try {
         if (editando) {
            await updateMutation.mutateAsync({ id: editando.id, data });
            push({ type: "success", message: "Subprograma atualizado" });
         } else {
            await createMutation.mutateAsync(data);
            push({ type: "success", message: "Subprograma cadastrado" });
         }
         setShowForm(false);
         setEditando(null);
      } catch (err) {
         erro(err, "Erro ao salvar o subprograma");
      }
   }

   async function handleDelete() {
      if (!excluindo) return;
      try {
         await deleteMutation.mutateAsync(excluindo.id);
         push({ type: "success", message: "Subprograma removido" });
         setExcluindo(null);
      } catch (err) {
         erro(err, "Erro ao remover o subprograma");
      }
   }

   return (
      <div className="space-y-2">
         <SubprogramasHeader
            count={isLoading ? undefined : subprogramas.length}
            onCreate={() => {
               setEditando(null);
               setShowForm(true);
            }}
         />

         {isLoading ? (
            <SubprogramasTableSkeleton />
         ) : error ? (
            <EmptyState
               icon={FaTriangleExclamation}
               title="Erro ao carregar os subprogramas"
               description={
                  error instanceof Error ? error.message : "Tente novamente"
               }
            />
         ) : subprogramas.length === 0 ? (
            <EmptyState
               icon={FaBookOpen}
               title="Nenhum subprograma cadastrado"
               description="Cadastre os subprogramas de instrução que a unidade conduz."
            />
         ) : (
            <>
               <SubprogramasFilters
                  value={filtros}
                  onChange={setFiltros}
                  subprogramas={subprogramas}
                  visiveis={filtrados.length}
               />

               {filtrados.length === 0 ? (
                  <EmptyState
                     icon={FaMagnifyingGlass}
                     title="Nenhum subprograma para esse filtro"
                     description="Ajuste a busca, o tipo ou a função."
                  />
               ) : (
                  <SubprogramasTable
                     subprogramas={filtrados}
                     isBusy={isBusy}
                     onEdit={(subprograma) => {
                        setEditando(subprograma);
                        setShowForm(true);
                     }}
                     onDelete={setExcluindo}
                  />
               )}
            </>
         )}

         <SubprogramaFormModal
            show={showForm}
            subprograma={editando}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={() => {
               setShowForm(false);
               setEditando(null);
            }}
            onSubmit={handleSubmit}
         />

         <ConfirmModal
            show={excluindo !== null}
            title={`Remover o subprograma ${excluindo?.codigo ?? ""}?`}
            description="Subprograma já incluído em algum PAOP não é removido."
            isLoading={deleteMutation.isPending}
            onClose={() => setExcluindo(null)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
         />
      </div>
   );
}
