"use client";

import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import { useToast } from "@/app/context/toast";
import {
   useCreateEtapa,
   useUpdateEtapa,
   useDeleteEtapa,
   useEtapaDetail,
} from "@/hooks/queries/useEtapas";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { AssignedTrip, EtapaFormModalProps, PoolTrip } from "./types";
import { useEtapaForm } from "./hooks/useEtapaForm";
import { useOiItems } from "./hooks/useOiItems";
import { useTripulantes } from "./hooks/useTripulantes";
import { DadosVooSection } from "./components/DadosVooSection";
import { OrdensInstrucaoSection } from "./components/OrdensInstrucaoSection";
import { TripulantesSection } from "./components/TripulantesSection";
import { FormActions } from "./components/FormActions";

function getMissionPool(
   etapas: EtapaItem[],
   assignedIds: Set<number>
): PoolTrip[] {
   const seen = new Map<number, PoolTrip>();
   for (const etapa of etapas) {
      for (const t of etapa.tripulantes) {
         if (!seen.has(t.trip_id) && !assignedIds.has(t.trip_id)) {
            seen.set(t.trip_id, {
               tripId: t.trip_id,
               trig: t.trig,
               nomeGuerra: t.nome_guerra,
               pGraduacao: t.p_g,
               lastFunc: t.func as FuncType,
               lastFuncBordo: t.func_bordo,
            });
         }
      }
   }
   return Array.from(seen.values());
}

export function EtapaFormModal({
   show,
   onClose,
   missao,
   editingEtapa,
}: EtapaFormModalProps) {
   const isEdit = !!editingEtapa;
   const { push } = useToast();
   const createMutation = useCreateEtapa();
   const updateMutation = useUpdateEtapa();
   const deleteMutation = useDeleteEtapa();
   const [confirmDelete, setConfirmDelete] = useState(false);

   // Fetch detail for edit mode
   const { data: etapaDetail, isLoading: loadingDetail } = useEtapaDetail(
      isEdit ? editingEtapa.id : null
   );

   // Fetch last etapa detail for pre-fill on create
   const lastEtapa =
      missao.etapas.length > 0 ? missao.etapas[missao.etapas.length - 1] : null;
   const { data: lastEtapaDetail, isLoading: loadingLastDetail } =
      useEtapaDetail(!isEdit && lastEtapa ? lastEtapa.id : null);

   // External data
   const { data: esfAerData, isLoading: loadingEsfAer } = useEsfAerList();
   const { data: tiposMissaoData, isLoading: loadingTiposMissao } =
      useTiposMissao();
   const { data: aeronavesData, isLoading: loadingAeronaves } = useAeronaves({
      per_page: 50,
   });

   const esfAerList = esfAerData ?? [];
   const tiposMissaoList = tiposMissaoData ?? [];
   const aeronavesList = aeronavesData?.items ?? [];

   // Custom hooks
   const {
      formData,
      setField,
      errors,
      tvoo,
      tvooValid,
      validate,
      initializeForm,
   } = useEtapaForm({
      show,
      isEdit,
      etapaDetail,
      missaoEtapas: missao.etapas,
   });

   const {
      oiItems,
      setOiItems,
      addOiItem,
      removeOiItem,
      updateOiItem,
      oiTotalTvoo,
      oiValid,
   } = useOiItems({ tvoo });

   const {
      poolTrips,
      setPoolTrips,
      assignedTrips,
      setAssignedTrips,
      assignedIds,
      removeFromGroup,
      updateFuncBordo,
      addTripToGroup,
      sensors,
      activeTrip,
      handleDragStart,
      handleDragEnd,
      resetSearch,
   } = useTripulantes();

   // Initialize all state when modal opens
   useEffect(() => {
      if (!show) return;

      initializeForm();
      resetSearch();
      setConfirmDelete(false);

      if (isEdit && etapaDetail) {
         setOiItems(
            etapaDetail.oi_etapas.map((oi) => ({
               uid: `oi-${oi.esf_aer_id}-${oi.tipo_missao_id}-${Math.random()}`,
               esf_aer_id: oi.esf_aer_id,
               tipo_missao_id: oi.tipo_missao_id,
               reg: oi.reg as "d" | "n" | "v",
               tvoo: oi.tvoo,
               tvooDisplay: minutesToTime(oi.tvoo),
            }))
         );
         const assigned: AssignedTrip[] = etapaDetail.tripulantes.map((t) => ({
            tripId: t.trip_id,
            trig: t.trig,
            nomeGuerra: t.nome_guerra,
            pGraduacao: t.p_g,
            func: t.func as FuncType,
            funcBordo: t.func_bordo,
         }));
         const assignedIdSet = new Set(assigned.map((t) => t.tripId));
         setAssignedTrips(assigned);
         setPoolTrips(getMissionPool(missao.etapas, assignedIdSet));
      } else if (lastEtapaDetail) {
         // Pre-fill from last etapa: OIs (without tvoo) + tripulantes
         setOiItems(
            lastEtapaDetail.oi_etapas.map((oi) => ({
               uid: `oi-${oi.esf_aer_id}-${oi.tipo_missao_id}-${Math.random()}`,
               esf_aer_id: oi.esf_aer_id,
               tipo_missao_id: oi.tipo_missao_id,
               reg: oi.reg as "d" | "n" | "v",
               tvoo: 0,
               tvooDisplay: "",
            }))
         );
         const assigned: AssignedTrip[] = lastEtapaDetail.tripulantes.map(
            (t) => ({
               tripId: t.trip_id,
               trig: t.trig,
               nomeGuerra: t.nome_guerra,
               pGraduacao: t.p_g,
               func: t.func as FuncType,
               funcBordo: t.func_bordo,
            })
         );
         const assignedIdSet = new Set(assigned.map((t) => t.tripId));
         setAssignedTrips(assigned);
         setPoolTrips(getMissionPool(missao.etapas, assignedIdSet));
      } else {
         setOiItems([]);
         setPoolTrips(getMissionPool(missao.etapas, new Set()));
         setAssignedTrips([]);
      }
   }, [
      show,
      isEdit,
      etapaDetail,
      lastEtapaDetail,
      missao.etapas,
      initializeForm,
      resetSearch,
      setOiItems,
      setAssignedTrips,
      setPoolTrips,
   ]);

   // Submit
   const isSubmitting = createMutation.isPending || updateMutation.isPending;

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!validate(oiValid)) return;

      const tripulantes = assignedTrips.map((t) => ({
         trip_id: t.tripId,
         func: t.func,
         func_bordo: t.funcBordo,
      }));

      const oi_etapas = oiItems
         .filter((oi) => oi.esf_aer_id && oi.tipo_missao_id && oi.tvoo > 0)
         .map((oi) => ({
            esf_aer_id: oi.esf_aer_id!,
            tipo_missao_id: oi.tipo_missao_id!,
            reg: oi.reg,
            tvoo: oi.tvoo,
         }));

      const basePayload = {
         data: formData.data,
         origem: formData.origem.toUpperCase(),
         destino: formData.destino.toUpperCase(),
         dep: formData.dep.length === 5 ? `${formData.dep}:00` : formData.dep,
         arr: formData.arr.length === 5 ? `${formData.arr}:00` : formData.arr,
         tvoo,
         anv: formData.anv,
         pousos: formData.pousos,
         tow: formData.tow,
         pax: formData.pax,
         carga: formData.carga,
         comb: formData.comb,
         lub: formData.lub,
         nivel: formData.nivel || null,
         sagem: formData.sagem,
         parte1: formData.parte1,
         obs: formData.obs || null,
         tripulantes,
         oi_etapas,
      };

      try {
         if (isEdit) {
            const res = await updateMutation.mutateAsync({
               id: editingEtapa!.id,
               data: basePayload,
            });
            push({
               title: "Sucesso!",
               message: res.message ?? "Etapa atualizada",
               type: res.ok ? "success" : "error",
            });
            if (res.ok) onClose();
         } else {
            const res = await createMutation.mutateAsync({
               ...basePayload,
               missao_id: missao.id,
            });
            push({
               title: "Sucesso!",
               message: res.message ?? "Etapa criada",
               type: res.ok ? "success" : "error",
            });
            if (res.ok) onClose();
         }
      } catch (err) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar etapa",
            type: "error",
         });
      }
   }

   // Delete
   async function handleDelete() {
      if (!confirmDelete) {
         setConfirmDelete(true);
         return;
      }
      try {
         const res = await deleteMutation.mutateAsync(editingEtapa!.id);
         push({
            title: "Sucesso!",
            message: res.message ?? "Etapa excluída",
            type: res.ok ? "success" : "error",
         });
         if (res.ok) onClose();
      } catch (err) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao excluir etapa",
            type: "error",
         });
      }
   }

   const isLoading =
      (isEdit && loadingDetail) ||
      (!isEdit && !!lastEtapa && loadingLastDetail) ||
      loadingEsfAer ||
      loadingTiposMissao ||
      loadingAeronaves;

   return (
      <Modal show={show} size="6xl" onClose={onClose} dismissible>
         <ModalHeader>
            {isEdit
               ? `Editar Etapa #${editingEtapa?.id} — Missão #${missao.id}`
               : `Nova Etapa — Missão #${missao.id}${missao.titulo ? ` · ${missao.titulo}` : ""}`}
         </ModalHeader>
         <ModalBody className="max-h-[80vh] overflow-y-auto">
            {isLoading ? (
               <div className="flex items-center justify-center py-16">
                  <Spinner size="lg" color="failure" />
               </div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                  <DadosVooSection
                     formData={formData}
                     setField={setField}
                     errors={errors}
                     tvoo={tvoo}
                     tvooValid={tvooValid}
                     aeronavesList={aeronavesList}
                  />

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

                  <TripulantesSection
                     poolTrips={poolTrips}
                     assignedTrips={assignedTrips}
                     assignedIds={assignedIds}
                     updateFuncBordo={updateFuncBordo}
                     removeFromGroup={removeFromGroup}
                     addTripToGroup={addTripToGroup}
                     sensors={sensors}
                     activeTrip={activeTrip}
                     handleDragStart={handleDragStart}
                     handleDragEnd={handleDragEnd}
                  />

                  <FormActions
                     onClose={onClose}
                     isSubmitting={isSubmitting}
                     isEdit={isEdit}
                     disabled={
                        isSubmitting ||
                        !tvooValid ||
                        (oiItems.length > 0 && !oiValid)
                     }
                     onDelete={isEdit ? handleDelete : undefined}
                     isDeleting={deleteMutation.isPending}
                     confirmDelete={confirmDelete}
                  />
               </form>
            )}
         </ModalBody>
      </Modal>
   );
}
