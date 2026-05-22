"use client";

import { useEffect, useState } from "react";

import { useEtapaEditor } from "../_hooks/useEtapaEditor";
import { useDndContext } from "../_hooks/useDndContext";
import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../_state/MissaoDraftContext";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { Spinner } from "flowbite-react";

import { DadosVooSection } from "./DadosVooSection";
import { OrdensInstrucaoSection } from "./OrdensInstrucaoSection";
import { TripulantesSection } from "./TripulantesSection";

import { EtapaSectionCard } from "./EtapaSectionCard";
import { EspecificosSection } from "./especificos/EspecificosSection";
import { PreFilledBanner } from "./PreFilledBanner";

interface EtapaContentProps {
   localId: string;
}

export function EtapaContent({ localId }: EtapaContentProps) {
   const draft = useMissaoDraft();
   const dispatch = useMissaoDraftDispatch();

   const editor = useEtapaEditor(localId);
   const {
      etapa,
      formData,
      setField,
      errors,
      tvoo,
      tvooValid,
      crossesDay,
      oiItems,
      addOiItem,
      removeOiItem,
      updateOiItem,
      oiTotalTvoo,
      oiValid,
      poolTrips,
      assignedTrips,
      assignedIds,
      removeAllFromFunc,
      removeFromGroup,
      updateFuncBordo,
      addTripToGroup,
      pqd,
      revo,
      heavyCds,
      addEspecifico,
      removeEspecifico,
      updatePqd,
      updateRevo,
      updateHeavyCds,
   } = editor;

   const { sensors, activeTrip, handleDragStart, handleDragEnd } =
      useDndContext({
         selectedLocalId: localId,
         assignedTrips,
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

   const isLoadingExternal = loadingAnv || loadingEsfAer || loadingTiposMissao;

   return (
      <>
         <PreFilledBanner
            visible={showPreFilled}
            onDismiss={() => setBannerDismissed(true)}
         />

         {isLoadingExternal && (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4">
               <Spinner size="sm" color="failure" />
               <span className="ml-2 text-xs text-gray-500">
                  Carregando dados auxiliares...
               </span>
            </div>
         )}

         <EtapaSectionCard title="Dados do Voo">
            <DadosVooSection
               formData={formData}
               setField={setField}
               errors={errors}
               tvoo={tvoo}
               tvooValid={tvooValid}
               crossesDay={crossesDay}
               aeronavesList={aeronavesList}
            />
         </EtapaSectionCard>

         <EtapaSectionCard title="Ordens de Instrução">
            <OrdensInstrucaoSection
               oiItems={oiItems}
               addOiItem={addOiItem}
               removeOiItem={removeOiItem}
               updateOiItem={updateOiItem}
               oiTotalTvoo={oiTotalTvoo}
               oiValid={oiValid}
               tvoo={tvoo}
               esfAerList={esfAerList}
               tiposMissaoList={tiposMissaoList}
            />
         </EtapaSectionCard>

         <EtapaSectionCard title="Tripulantes">
            <TripulantesSection
               poolTrips={poolTrips}
               assignedTrips={assignedTrips}
               assignedIds={assignedIds}
               updateFuncBordo={updateFuncBordo}
               removeAllFromFunc={removeAllFromFunc}
               removeFromGroup={removeFromGroup}
               addTripToGroup={addTripToGroup}
               sensors={sensors}
               activeTrip={activeTrip}
               handleDragStart={handleDragStart}
               handleDragEnd={handleDragEnd}
            />
         </EtapaSectionCard>

         <EtapaSectionCard title="Específicos da Missão">
            <EspecificosSection
               pqd={pqd}
               revo={revo}
               heavyCds={heavyCds}
               addEspecifico={addEspecifico}
               removeEspecifico={removeEspecifico}
               updatePqd={updatePqd}
               updateRevo={updateRevo}
               updateHeavyCds={updateHeavyCds}
            />
         </EtapaSectionCard>
      </>
   );
}
