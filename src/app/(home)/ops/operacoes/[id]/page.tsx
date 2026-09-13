"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tabs, TabItem } from "flowbite-react";
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

export default function OperacaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const opId = Number(params.id);

   const { data: op, isLoading, error, refetch } = useOperacao(opId);
   const {
      data: etapas,
      isLoading: loadingEtapas,
      isError: etapasError,
      refetch: refetchEtapas,
   } = useOperacaoEtapas(opId);
   const deleteMutation = useDeleteOperacao();
   const { push } = useToast();

   const [activeTab, setActiveTab] = useState(0);
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
         <div
            role="alert"
            className="space-y-3 rounded border border-slate-200 bg-white px-4 py-12 text-center shadow-sm"
         >
            <p className="text-sm font-semibold text-rose-700">
               {notFound
                  ? "Operação não encontrada"
                  : "Erro ao carregar a operação"}
            </p>
            {!notFound && (
               <Button
                  color="light"
                  size="sm"
                  onClick={() => refetch()}
                  className="mx-auto"
               >
                  Tentar novamente
               </Button>
            )}
            <Button
               color="light"
               size="sm"
               onClick={() => router.push("/ops/operacoes")}
               className="mx-auto"
            >
               Voltar para a lista
            </Button>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <OperacaoHeader
            op={op}
            onEdit={() => setShowEdit(true)}
            onDelete={() => setShowDelete(true)}
         />

         <Tabs
            aria-label="Abas da operação"
            variant="underline"
            onActiveTabChange={setActiveTab}
            theme={{
               tablist: {
                  tabitem: {
                     base: "flex items-center justify-center gap-1 px-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-600 pointer-coarse:min-h-[44px]",
                     icon: "mr-1 size-4",
                  },
               },
               tabpanel:
                  "py-0 focus-visible:outline-2 focus-visible:outline-primary-600",
            }}
         >
            <TabItem active title="Estatísticas" icon={MdInsights}>
               {activeTab === 0 && (
                  <div className="space-y-2">
                     <KpiGrid kpis={op.kpis} />
                     <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
                        <EsforcoCard esforco={op.esforco} />
                        <SeboCard sebo={op.sebo} />
                     </div>
                  </div>
               )}
            </TabItem>
            <TabItem title="Etapas" icon={MdLayers}>
               {activeTab === 1 &&
                  (loadingEtapas ? (
                     <EtapasTableSkeleton />
                  ) : etapasError ? (
                     <div
                        role="alert"
                        className="space-y-3 rounded border border-slate-200 bg-white p-6 text-center shadow-sm"
                     >
                        <p className="text-sm text-red-700">
                           Não foi possível carregar as etapas.
                        </p>
                        <Button
                           color="light"
                           size="sm"
                           className="mx-auto"
                           onClick={() => refetchEtapas()}
                        >
                           Tentar novamente
                        </Button>
                     </div>
                  ) : (
                     <EtapasTable
                        opId={op.id}
                        etapas={etapas ?? []}
                        onAssociar={() => setShowAssociar(true)}
                     />
                  ))}
            </TabItem>
            <TabItem title="Efetivo" icon={MdGroups}>
               {activeTab === 2 && <PessoalTable op={op} />}
            </TabItem>
         </Tabs>

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
