"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { MdInsights, MdLayers, MdGroups } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import {
   useDeleteOperacao,
   useOperacao,
   useOperacaoEtapas,
} from "@/hooks/queries/useOperacoes";
import { OperacaoFetchError } from "services/routes/ops/operacoes";
import { OperacaoHeader } from "../components/OperacaoHeader";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { KpiGrid } from "../components/KpiGrid";
import { EsforcoCard } from "../components/EsforcoCard";
import { SeboCard } from "../components/SeboCard";
import { EtapasTable } from "../components/EtapasTable";
import { EtapasTableSkeleton } from "../components/EtapasTableSkeleton";
import { PessoalTable } from "../components/PessoalTable";
import { OperacaoFormModal } from "../components/OperacaoFormModal";
import { AssociarEtapasModal } from "../components/AssociarEtapasModal";
import { OperacaoDetailSkeleton } from "../components/OperacaoDetailSkeleton";

const TABS = [
   { key: "estatistica", label: "Estatística", icon: MdInsights },
   { key: "etapas", label: "Etapas", icon: MdLayers },
   { key: "efetivo", label: "Efetivo", icon: MdGroups },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function OperacaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const opId = Number(params.id);

   const { data: op, isLoading, error, refetch } = useOperacao(opId);
   const { data: etapas, isLoading: loadingEtapas } = useOperacaoEtapas(opId);
   const deleteMutation = useDeleteOperacao();
   const { push } = useToast();

   const [activeTab, setActiveTab] = useState<TabKey>("estatistica");
   const [showEdit, setShowEdit] = useState(false);
   const [showAssociar, setShowAssociar] = useState(false);
   const [showDelete, setShowDelete] = useState(false);

   async function handleDelete() {
      try {
         const res = await deleteMutation.mutateAsync(opId);
         push({
            title: res.ok ? "Excluída" : "Erro",
            message: res.message || "Operação excluída",
            type: res.ok ? "success" : "error",
         });
         if (res.ok) {
            router.push("/ops/operacoes");
         } else {
            setShowDelete(false);
         }
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao excluir",
            type: "error",
         });
         setShowDelete(false);
      }
   }

   if (isLoading) {
      return <OperacaoDetailSkeleton />;
   }

   if (error || !op) {
      const notFound =
         error instanceof OperacaoFetchError && error.status === 404;
      return (
         <div className="rounded border border-rose-200 bg-rose-50 px-4 py-12 text-center">
            <p className="text-sm font-semibold text-rose-700">
               {notFound
                  ? "Operação não encontrada"
                  : "Erro ao carregar a operação"}
            </p>
            {!notFound && (
               <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-xs font-semibold text-rose-600 underline"
               >
                  Tentar novamente
               </button>
            )}
            <button
               type="button"
               onClick={() => router.push("/ops/operacoes")}
               className="mt-2 block w-full text-xs font-semibold text-rose-600 underline"
            >
               Voltar para a lista
            </button>
         </div>
      );
   }

   return (
      <div className="flex flex-col">
         <OperacaoHeader
            op={op}
            onEdit={() => setShowEdit(true)}
            onDelete={() => setShowDelete(true)}
         />

         {/* Abas */}
         <div className="mb-5 border-b border-gray-200">
            <nav className="flex gap-0" aria-label="Abas da operação">
               {TABS.map((tab) => (
                  <button
                     key={tab.key}
                     type="button"
                     onClick={() => setActiveTab(tab.key)}
                     className={clsx(
                        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === tab.key
                           ? "border-red-500 text-red-600"
                           : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                     )}
                  >
                     <tab.icon className="h-4 w-4" />
                     {tab.label}
                  </button>
               ))}
            </nav>
         </div>

         {/* Conteúdo das abas */}
         {activeTab === "estatistica" && (
            <>
               <div className="mb-5">
                  <KpiGrid kpis={op.kpis} />
               </div>
               <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                  <EsforcoCard esforco={op.esforco} />
                  <SeboCard sebo={op.sebo} />
               </div>
            </>
         )}

         {activeTab === "etapas" &&
            (loadingEtapas ? (
               <EtapasTableSkeleton />
            ) : (
               <EtapasTable
                  opId={op.id}
                  etapas={etapas ?? []}
                  onAssociar={() => setShowAssociar(true)}
               />
            ))}

         {activeTab === "efetivo" && <PessoalTable op={op} />}

         <OperacaoFormModal
            show={showEdit}
            onClose={() => setShowEdit(false)}
            editing={op}
         />
         <AssociarEtapasModal
            show={showAssociar}
            onClose={() => setShowAssociar(false)}
            op={op}
         />
         <ConfirmDeleteModal
            show={showDelete}
            message={`Excluir a operação "${op.nome}"? Os registros de voo (etapas) serão preservados.`}
            isDeleting={deleteMutation.isPending}
            onClose={() => setShowDelete(false)}
            onConfirm={handleDelete}
         />
      </div>
   );
}
