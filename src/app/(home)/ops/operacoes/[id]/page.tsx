"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
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
import { PessoalTable } from "../components/PessoalTable";
import { OperacaoFormModal } from "../components/OperacaoFormModal";
import { AssociarEtapasModal } from "../components/AssociarEtapasModal";
import { OperacaoDetailSkeleton } from "../components/OperacaoDetailSkeleton";

export default function OperacaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const opId = Number(params.id);

   const { data: op, isLoading, error, refetch } = useOperacao(opId);
   const { data: etapas, isLoading: loadingEtapas } = useOperacaoEtapas(opId);
   const deleteMutation = useDeleteOperacao();
   const { push } = useToast();

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
         <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-12 text-center">
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

         <div className="mb-5">
            <KpiGrid kpis={op.kpis} />
         </div>
         <div className="mb-5">
            {loadingEtapas ? (
               <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
                  <Spinner color="failure" size="lg" />
               </div>
            ) : (
               <EtapasTable
                  opId={op.id}
                  etapas={etapas ?? []}
                  onAssociar={() => setShowAssociar(true)}
               />
            )}
         </div>
         <div className="mb-5 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            <EsforcoCard esforco={op.esforco} />
            <SeboCard sebo={op.sebo} />
         </div>

         {/* <PessoalTable op={op} /> */}

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
