"use client";

import { useEffect, useState } from "react";

import { useEtapaEditor } from "../hooks/useEtapaEditor";
import { useDndContext } from "../hooks/useDndContext";
import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../context/MissaoDraftContext";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { Badge, Spinner } from "flowbite-react";

import { DadosVooSection } from "./DadosVooSection";
import { OrdensInstrucaoSection } from "./OrdensInstrucaoSection";
import { TripulantesSection } from "./TripulantesSection";

import { EtapaSectionCard } from "./EtapaSectionCard";
import { EspecificosSection } from "./especificos/EspecificosSection";
import { PreFilledBanner } from "./PreFilledBanner";

interface EtapaContentProps {
   localId: string;
   /** Houve tentativa de salvar recusada: exibe erro nos campos nao tocados. */
   showErrors: boolean;
}

export function EtapaContent({ localId, showErrors }: EtapaContentProps) {
   const draft = useMissaoDraft();
   const dispatch = useMissaoDraftDispatch();

   const { etapa, form, oi, trips, especificos } = useEtapaEditor(localId);

   const { sensors, activeTrip, handleDragStart, handleDragEnd } =
      useDndContext({
         selectedLocalId: localId,
         assignedTrips: trips.assignedTrips,
         dispatch,
      });

   const { data: aeronavesData, isLoading: loadingAnv } = useAeronaves({
      per_page: 100,
      is_sim: false,
   });
   const { data: esfAerData, isLoading: loadingEsfAer } = useEsfAerList();
   const { data: tiposMissaoData, isLoading: loadingTiposMissao } =
      useTiposMissao();

   const aeronavesList = aeronavesData?.items ?? [];
   const esfAerList = esfAerData ?? [];
   const tiposMissaoList = tiposMissaoData ?? [];

   const [bannerDismissed, setBannerDismissed] = useState(false);
   useEffect(() => {
      setBannerDismissed(false);
   }, [localId]);

   const etapaIdx = draft.etapas.findIndex((e) => e.localId === localId);
   const hasPriorEtapa = etapaIdx > 0;
   const showPreFilled =
      etapa.status === "rascunho" &&
      hasPriorEtapa &&
      !bannerDismissed &&
      !etapa.serverId;

   const totalEspecificos =
      especificos.pqd.length +
      especificos.revo.length +
      especificos.heavyCds.length;

   const isLoadingExternal = loadingAnv || loadingEsfAer || loadingTiposMissao;

   return (
      <>
         <PreFilledBanner
            visible={showPreFilled}
            onDismiss={() => setBannerDismissed(true)}
         />

         {isLoadingExternal && (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4">
               <Spinner size="sm" color="primary" />
               <span className="ml-2 text-xs text-gray-500">
                  Carregando dados auxiliares...
               </span>
            </div>
         )}

         <EtapaSectionCard title="Dados do Voo">
            <DadosVooSection form={form} aeronavesList={aeronavesList} />
         </EtapaSectionCard>

         <EtapaSectionCard title="Ordens de Instrução">
            <OrdensInstrucaoSection
               oi={oi}
               tvoo={form.tvoo}
               esfAerList={esfAerList}
               tiposMissaoList={tiposMissaoList}
            />
         </EtapaSectionCard>

         <EtapaSectionCard title="Tripulantes">
            <TripulantesSection
               trips={trips}
               sensors={sensors}
               activeTrip={activeTrip}
               handleDragStart={handleDragStart}
               handleDragEnd={handleDragEnd}
            />
         </EtapaSectionCard>

         <EtapaSectionCard
            title="Específicos da Missão"
            badge={
               totalEspecificos > 0 ? (
                  <Badge color="gray" size="xs">
                     {totalEspecificos}
                  </Badge>
               ) : undefined
            }
         >
            <EspecificosSection
               especificos={especificos}
               showErrors={showErrors}
            />
         </EtapaSectionCard>
      </>
   );
}
