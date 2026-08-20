"use client";

import { useEffect, useMemo, useState } from "react";
import {
   FaCalendarCheck,
   FaListCheck,
   FaMagnifyingGlass,
   FaTriangleExclamation,
} from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   usePaops,
   usePaop,
   useCreatePaop,
   useUpdatePaop,
   useDeletePaop,
   useSetPaopSubprogramas,
} from "@/hooks/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { PaopResumo, StatusPaop } from "services/routes/instrucao/paops";
import { PaopHeader } from "./components/PaopHeader";
import { PaopAnoBar } from "./components/PaopAnoBar";
import { PaopItemCard } from "./components/PaopItemCard";
import { PaopFormModal } from "./components/PaopFormModal";
import { PaopSubprogramasModal } from "./components/PaopSubprogramasModal";
import { PaopSkeleton } from "./components/PaopSkeleton";
import {
   SubprogramasFilters,
   FILTROS_VAZIOS,
   type SubprogramasFiltersState,
} from "../subprogramas/components/SubprogramasFilters";

/**
 * PAOP — plano anual de operação e preparo da unidade.
 *
 * Um plano por ano (uq uae+ano), então a tela é um seletor de ano em vez de
 * listagem com página de detalhe: escolhe-se o ano e trabalha-se nele.
 */
export default function PaopPage() {
   const { push } = useToast();

   const { data: paops = [], isLoading, error } = usePaops();
   const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
   const { data: paop, isLoading: carregandoPlano } = usePaop(selecionadoId);

   const createMutation = useCreatePaop();
   const updateMutation = useUpdatePaop();
   const deleteMutation = useDeletePaop();
   const subprogramasMutation = useSetPaopSubprogramas();

   const [showForm, setShowForm] = useState(false);
   const [editando, setEditando] = useState<PaopResumo | null>(null);
   const [showSubprogramas, setShowSubprogramas] = useState(false);
   const [excluindo, setExcluindo] = useState<PaopResumo | null>(null);
   const [filtros, setFiltros] =
      useState<SubprogramasFiltersState>(FILTROS_VAZIOS);

   // Mesmo deck do cadastro de subprogramas, aplicado aos itens do plano.
   const itens = paop?.subprogramas ?? [];
   const itensFiltrados = useMemo(() => {
      const busca = filtros.q.trim().toLowerCase();
      return itens.filter(
         ({ subprograma: s }) =>
            (filtros.tipo === null || s.tipo === filtros.tipo) &&
            (filtros.func === null || s.func === filtros.func) &&
            (busca === "" ||
               s.codigo.toLowerCase().includes(busca) ||
               s.descricao.toLowerCase().includes(busca))
      );
   }, [itens, filtros]);

   // Abre no plano do ano corrente — é o de trabalho; sem ele, no mais
   // recente. Plano recém-criado ou removido reposiciona a seleção sem o
   // usuário ter de escolher de novo.
   useEffect(() => {
      if (paops.length === 0) {
         setSelecionadoId(null);
         return;
      }
      const anoAtual = new Date().getFullYear();
      setSelecionadoId((atual) =>
         atual !== null && paops.some((p) => p.id === atual)
            ? atual
            : (paops.find((p) => p.ano === anoAtual) ?? paops[0]).id
      );
   }, [paops]);

   const selecionado = paops.find((p) => p.id === selecionadoId) ?? null;

   const isBusy =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      subprogramasMutation.isPending;

   function erro(err: unknown, fallback: string) {
      push({
         type: "error",
         message: err instanceof Error ? err.message : fallback,
      });
   }

   async function handleSubmitPlano(data: {
      ano: number;
      data_ini: string;
      data_fim: string;
      status: StatusPaop;
   }) {
      try {
         if (editando) {
            await updateMutation.mutateAsync({
               id: editando.id,
               data: {
                  data_ini: data.data_ini,
                  data_fim: data.data_fim,
                  status: data.status,
               },
            });
            push({ type: "success", message: "PAOP atualizado" });
         } else {
            const criado = await createMutation.mutateAsync(data);
            push({ type: "success", message: "PAOP criado" });
            if (criado.data) setSelecionadoId(criado.data.id);
         }
         setShowForm(false);
         setEditando(null);
      } catch (err) {
         erro(err, "Erro ao salvar o PAOP");
      }
   }

   async function handleSubprogramas(subprogramaIds: number[]) {
      if (!selecionado) return;
      try {
         await subprogramasMutation.mutateAsync({
            id: selecionado.id,
            subprogramaIds,
         });
         push({ type: "success", message: "Subprogramas do PAOP atualizados" });
         setShowSubprogramas(false);
      } catch (err) {
         erro(err, "Erro ao salvar os subprogramas");
      }
   }

   async function handleDelete() {
      if (!excluindo) return;
      try {
         await deleteMutation.mutateAsync(excluindo.id);
         push({ type: "success", message: "PAOP removido" });
         setExcluindo(null);
      } catch (err) {
         erro(err, "Erro ao remover o PAOP");
      }
   }

   return (
      <div className="space-y-2">
         <PaopHeader
            onCreate={() => {
               setEditando(null);
               setShowForm(true);
            }}
         />

         {isLoading ? (
            <PaopSkeleton />
         ) : error ? (
            <EmptyState
               icon={FaTriangleExclamation}
               title="Erro ao carregar os PAOPs"
               description={
                  error instanceof Error ? error.message : "Tente novamente"
               }
            />
         ) : !selecionado ? (
            <EmptyState
               icon={FaCalendarCheck}
               title="Nenhum PAOP aberto"
               description="Abra o plano do ano para montar a relação de subprogramas."
            />
         ) : (
            <>
               <PaopAnoBar
                  paops={paops}
                  selecionado={selecionado}
                  isBusy={isBusy}
                  onSelect={setSelecionadoId}
                  onEdit={() => {
                     setEditando(selecionado);
                     setShowForm(true);
                  }}
                  onDelete={() => setExcluindo(selecionado)}
                  onGerenciarSubprogramas={() => setShowSubprogramas(true)}
               />

               {carregandoPlano ? (
                  <PaopSkeleton />
               ) : itens.length === 0 ? (
                  <EmptyState
                     icon={FaListCheck}
                     title="Plano sem subprogramas"
                     description="Use “Subprogramas” para montar a relação deste ano."
                  />
               ) : (
                  <>
                     <SubprogramasFilters
                        value={filtros}
                        onChange={setFiltros}
                        subprogramas={itens.map((i) => i.subprograma)}
                        visiveis={itensFiltrados.length}
                     />

                     {itensFiltrados.length === 0 ? (
                        <EmptyState
                           icon={FaMagnifyingGlass}
                           title="Nenhum subprograma para esse filtro"
                           description="Ajuste a busca, o tipo ou a função."
                        />
                     ) : (
                        itensFiltrados.map((item) => (
                           <PaopItemCard
                              key={item.id}
                              paopId={selecionado.id}
                              item={item}
                           />
                        ))
                     )}
                  </>
               )}
            </>
         )}

         <PaopFormModal
            show={showForm}
            paop={editando}
            anosOcupados={paops.map((p) => p.ano)}
            isSaving={createMutation.isPending || updateMutation.isPending}
            onClose={() => {
               setShowForm(false);
               setEditando(null);
            }}
            onSubmit={handleSubmitPlano}
         />

         <PaopSubprogramasModal
            show={showSubprogramas}
            ano={selecionado?.ano ?? 0}
            selecionadosIniciais={itens.map((i) => i.subprograma.id)}
            bloqueados={itens
               .filter((i) => i.tripulantes.length > 0)
               .map((i) => i.subprograma.id)}
            isSaving={subprogramasMutation.isPending}
            onClose={() => setShowSubprogramas(false)}
            onSubmit={handleSubprogramas}
         />

         <ConfirmModal
            show={excluindo !== null}
            title={`Remover o PAOP ${excluindo?.ano ?? ""}?`}
            description="Plano com tripulante matriculado não é removido."
            isLoading={deleteMutation.isPending}
            onClose={() => setExcluindo(null)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
         />
      </div>
   );
}
