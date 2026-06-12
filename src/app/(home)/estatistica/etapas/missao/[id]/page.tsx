"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button } from "flowbite-react";
import { HiArrowLeft, HiRefresh } from "react-icons/hi";

import {
   getMissao,
   type MissaoComEtapasDetail,
} from "services/routes/estatistica/etapas";

import {
   MissaoDraftProvider,
   useMissaoDraftDispatch,
} from "../_state/MissaoDraftContext";
import { emptyDraft } from "../_state/helpers";
import { MissaoEditor } from "../_components/MissaoEditor";
import { MissaoEditorSkeleton } from "../_components/MissaoEditorSkeleton";

interface HydrateAndRenderProps {
   missao: MissaoComEtapasDetail;
   selectEtapaServerId?: number;
}

function HydrateAndRender({
   missao,
   selectEtapaServerId,
}: HydrateAndRenderProps) {
   const dispatch = useMissaoDraftDispatch();

   useEffect(() => {
      dispatch({
         type: "LOAD_FROM_SERVER",
         payload: { missao, selectEtapaServerId },
      });
      // Run only once on mount; payload comes from a one-shot fetch.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <MissaoEditor mode="edit" />;
}

export default function EditarMissaoPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const searchParams = useSearchParams();
   const idStr = params?.id ?? "";
   const id = Number(idStr);
   const etapaParam = searchParams.get("etapa");
   const selectEtapaServerId = etapaParam ? Number(etapaParam) : undefined;

   const enabled = Number.isFinite(id) && id > 0;

   const { data, isLoading, isError, error, refetch } = useQuery({
      queryKey: ["missao", id],
      queryFn: ({ signal }) => getMissao(id, signal),
      enabled,
      staleTime: 0,
      gcTime: 0,
   });

   if (!enabled) {
      return (
         <div className="space-y-3 px-6 py-6">
            <Alert color="failure">ID de missão inválido.</Alert>
            <Button
               color="light"
               size="sm"
               onClick={() => router.push("/estatistica/etapas")}
            >
               <HiArrowLeft className="mr-2 h-4 w-4" />
               Voltar à lista
            </Button>
         </div>
      );
   }

   // isError precisa vir antes do guard de loading: com a query em erro,
   // `data` fica undefined e o guard `!data` seguraria o skeleton para sempre
   if (isError) {
      return (
         <div className="space-y-3 px-6 py-6">
            <Alert color="failure">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar a missão"}
            </Alert>
            <div className="flex flex-wrap gap-2">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => router.push("/estatistica/etapas")}
               >
                  <HiArrowLeft className="mr-2 h-4 w-4" />
                  Voltar à lista
               </Button>
               <Button color="red" size="sm" onClick={() => refetch()}>
                  <HiRefresh className="mr-2 h-4 w-4" />
                  Tentar novamente
               </Button>
            </div>
         </div>
      );
   }

   if (isLoading || !data) {
      return <MissaoEditorSkeleton />;
   }

   return (
      <MissaoDraftProvider key={id} initialDraft={emptyDraft()}>
         <HydrateAndRender
            missao={data}
            selectEtapaServerId={
               selectEtapaServerId && Number.isFinite(selectEtapaServerId)
                  ? selectEtapaServerId
                  : undefined
            }
         />
      </MissaoDraftProvider>
   );
}
