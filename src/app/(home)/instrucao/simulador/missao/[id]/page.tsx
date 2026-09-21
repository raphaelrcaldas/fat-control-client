"use client";

import { useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button } from "flowbite-react";
import { HiArrowLeft, HiRefresh } from "react-icons/hi";

import { getMissao } from "services/routes/estatistica/etapas";
import { missaoEtpKeys } from "@/hooks/queries/useEtapas";
import PermDenied from "@/app/components/permDenied";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { SimuladorEditorSkeleton } from "../components/SimuladorEditorSkeleton";
import { SimuladorMissaoEditor } from "../components/SimuladorMissaoEditor";

export default function EditarMissaoSimuladorPage() {
   const params = useParams<{ id: string }>();
   const searchParams = useSearchParams();
   const router = useRouter();
   const id = Number(params.id ?? "");
   const etapaParam = searchParams.get("etapa");
   const requestedEtapaId = etapaParam ? Number(etapaParam) : undefined;
   const enabled = Number.isFinite(id) && id > 0;

   // A rota e alcancavel diretamente e abre um formulario que persiste em
   // estatistica/*. Por isso usa o mesmo gate do editor completo de etapas.
   const { hasPerm } = usePermBased();
   const canEdit = hasPerm("estatistica.etapas", "update");
   const canCreate = hasPerm("estatistica.etapas", "create");
   const canDelete = hasPerm("estatistica.etapas", "delete");

   const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
      queryKey: missaoEtpKeys.detail(id),
      queryFn: ({ signal }) => getMissao(id, signal),
      enabled: enabled && canEdit,
      staleTime: 0,
      gcTime: 0,
   });

   const handleRefetch = useCallback(async () => {
      const result = await refetch();
      return result.data;
   }, [refetch]);

   if (!canEdit) {
      return (
         <div className="space-y-2">
            <PermDenied />
         </div>
      );
   }

   if (!enabled) {
      return (
         <div className="space-y-2">
            <Alert color="failure">ID de missão inválido.</Alert>
            <Button
               color="light"
               size="sm"
               onClick={() => router.push("/instrucao/simulador")}
            >
               <HiArrowLeft className="mr-2 h-4 w-4" />
               Voltar ao simulador
            </Button>
         </div>
      );
   }

   // Sem dado anterior, o erro inicial ainda precisa de uma tela dedicada.
   // Depois de um carregamento bem-sucedido, porém, React Query preserva
   // `data` durante um refetch que falha. Manter o editor montado conserva os
   // rascunhos locais enquanto o alerta oferece nova tentativa.
   if (isError && !data) {
      return (
         <div className="space-y-2">
            <Alert color="failure">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar a missão de simulador"}
            </Alert>
            <div className="flex flex-wrap gap-2">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => router.push("/instrucao/simulador")}
               >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao simulador
               </Button>
               <Button color="light" size="sm" onClick={() => refetch()}>
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Tentar novamente
               </Button>
            </div>
         </div>
      );
   }

   if (isLoading || !data) {
      return <SimuladorEditorSkeleton />;
   }

   if (!data.is_simulador) {
      return (
         <div className="space-y-2">
            <Alert color="failure">
               Esta missão pertence à estatística de etapas e não pode ser
               editada no simulador.
            </Alert>
            <Button
               color="light"
               size="sm"
               onClick={() => router.push("/instrucao/simulador")}
            >
               <HiArrowLeft className="mr-2 h-4 w-4" />
               Voltar ao simulador
            </Button>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         {isError ? (
            <div className="space-y-2">
               <Alert color="failure">
                  {error instanceof Error
                     ? error.message
                     : "Erro ao recarregar a missão de simulador"}
               </Alert>
               <Button color="light" size="sm" onClick={() => refetch()}>
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Tentar novamente
               </Button>
            </div>
         ) : null}
         <SimuladorMissaoEditor
            key={id}
            missao={data}
            initialEtapaId={
               requestedEtapaId && Number.isFinite(requestedEtapaId)
                  ? requestedEtapaId
                  : undefined
            }
            canCreate={canCreate}
            canDelete={canDelete}
            isFetching={isFetching}
            onRefetch={handleRefetch}
         />
      </div>
   );
}
