"use client";

import { useCallback, useMemo } from "react";

import type { FuncType } from "@/constants/tripulantes/funcoes";
import { useFuncoes } from "@/hooks/queries";

import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../context/MissaoDraftContext";
import { escolherFuncBordo } from "../context/funcBordo";
import {
   buildPoolFromDraft,
   calcTvoo,
   selectEtapaTotals,
} from "../context/selectors";
import type {
   DraftAssignedTrip,
   DraftEtapa,
   DraftHeavyCds,
   DraftOIItem,
   DraftPoolTrip,
   DraftPqd,
   DraftRevo,
   EspecificoKind,
   EtapaFormData,
} from "../context/types";
import { deriveFormErrors, type FormErrors } from "../context/validators";

interface AddTripInput {
   id?: number;
   trig: string;
   user: { nome_guerra: string; p_g: string };
}

export interface EtapaFormGroup {
   formData: EtapaFormData;
   setField: <K extends keyof EtapaFormData>(
      key: K,
      value: EtapaFormData[K]
   ) => void;
   tvoo: number;
   /** Violacoes que travam o salvar (limites, horario, data). */
   errors: FormErrors;
}

export interface EtapaOiGroup {
   oiItems: DraftOIItem[];
   addOiItem: () => void;
   removeOiItem: (uid: string) => void;
   updateOiItem: (uid: string, patch: Partial<DraftOIItem>) => void;
   oiTotalTvoo: number;
}

export interface EtapaTripsGroup {
   poolTrips: DraftPoolTrip[];
   assignedTrips: DraftAssignedTrip[];
   assignedIds: Set<number>;
   removeAllFromFunc: (func: FuncType) => void;
   removeFromGroup: (tripId: number) => void;
   updateFuncBordo: (tripId: number, funcBordo: string) => void;
   addTripToGroup: (trip: AddTripInput, func: FuncType) => void;
}

export interface EtapaEspecificosGroup {
   pqd: DraftPqd[];
   revo: DraftRevo[];
   heavyCds: DraftHeavyCds[];
   addEspecifico: (kind: EspecificoKind) => void;
   removeEspecifico: (kind: EspecificoKind, uid: string) => void;
   updatePqd: (uid: string, patch: Partial<DraftPqd>) => void;
   updateRevo: (uid: string, patch: Partial<DraftRevo>) => void;
   updateHeavyCds: (uid: string, patch: Partial<DraftHeavyCds>) => void;
}

export interface UseEtapaEditorResult {
   etapa: DraftEtapa;
   form: EtapaFormGroup;
   oi: EtapaOiGroup;
   trips: EtapaTripsGroup;
   especificos: EtapaEspecificosGroup;
}

export function useEtapaEditor(localId: string): UseEtapaEditorResult {
   const { defaultBordo, posicoes } = useFuncoes();
   const draft = useMissaoDraft();
   const dispatch = useMissaoDraftDispatch();

   const etapa = useMemo(
      () => draft.etapas.find((e) => e.localId === localId),
      [draft.etapas, localId]
   );

   if (!etapa) {
      throw new Error(
         `useEtapaEditor: etapa with localId "${localId}" not found in draft`
      );
   }

   const formData = etapa.form;
   const oiItems = etapa.oiItems;
   const assignedTrips = etapa.assignedTrips;

   // Form derived state — reuse state helpers
   const tvoo = useMemo(
      () => calcTvoo(formData.dep, formData.arr),
      [formData.dep, formData.arr]
   );

   const setField = useCallback(
      <K extends keyof EtapaFormData>(key: K, value: EtapaFormData[K]) => {
         dispatch({
            type: "UPDATE_ETAPA_FORM",
            payload: {
               localId,
               patch: { [key]: value } as Partial<EtapaFormData>,
            },
         });
      },
      [dispatch, localId]
   );

   // Live errors derived from current form state
   const liveErrors = useMemo(
      () => deriveFormErrors(formData, tvoo),
      [formData, tvoo]
   );

   // OI totals — selectEtapaTotals encapsulates the canonical rule
   const { oiTvooSum } = useMemo(() => selectEtapaTotals(etapa), [etapa]);

   // Pool derived from the whole draft (excludes already-assigned trips
   // for the current etapa)
   const poolTrips = useMemo(
      () => buildPoolFromDraft(draft, localId),
      [draft, localId]
   );

   const assignedIds = useMemo(
      () => new Set(assignedTrips.map((t) => t.tripId)),
      [assignedTrips]
   );

   // OI actions
   const addOiItem = useCallback(() => {
      dispatch({ type: "ADD_OI", payload: { localId } });
   }, [dispatch, localId]);

   const removeOiItem = useCallback(
      (uid: string) => {
         dispatch({ type: "REMOVE_OI", payload: { localId, uid } });
      },
      [dispatch, localId]
   );

   const updateOiItem = useCallback(
      (uid: string, patch: Partial<DraftOIItem>) => {
         dispatch({
            type: "UPDATE_OI",
            payload: { localId, uid, patch },
         });
      },
      [dispatch, localId]
   );

   // Trip actions
   const removeAllFromFunc = useCallback(
      (func: FuncType) => {
         const remaining = assignedTrips.filter((t) => t.func !== func);
         dispatch({
            type: "SET_ETAPA_TRIPS",
            payload: { localId, trips: remaining },
         });
      },
      [assignedTrips, dispatch, localId]
   );

   const removeFromGroup = useCallback(
      (tripId: number) => {
         dispatch({ type: "REMOVE_TRIP", payload: { localId, tripId } });
      },
      [dispatch, localId]
   );

   const updateFuncBordo = useCallback(
      (tripId: number, funcBordo: string) => {
         dispatch({
            type: "UPDATE_FUNC_BORDO",
            payload: { localId, tripId, funcBordo },
         });
      },
      [dispatch, localId]
   );

   const addTripToGroup = useCallback(
      (trip: AddTripInput, func: FuncType) => {
         const tripId = trip.id;
         if (tripId == null) return;
         if (assignedIds.has(tripId)) return;

         const assigned: DraftAssignedTrip = {
            tripId,
            trig: trip.trig,
            nomeGuerra: trip.user.nome_guerra,
            pGraduacao: trip.user.p_g,
            func,
            funcBordo: escolherFuncBordo({
               func,
               posicoes: posicoes(func),
               fallback: defaultBordo(func),
               anterior: poolTrips.find((p) => p.tripId === tripId),
               atribuidos: assignedTrips,
            }),
         };

         dispatch({
            type: "ADD_TRIP",
            payload: { localId, trip: assigned },
         });
      },
      [
         assignedIds,
         assignedTrips,
         dispatch,
         localId,
         defaultBordo,
         poolTrips,
         posicoes,
      ]
   );

   // Especifico actions
   const addEspecifico = useCallback(
      (kind: EspecificoKind) => {
         dispatch({ type: "ADD_ESPECIFICO", payload: { localId, kind } });
      },
      [dispatch, localId]
   );

   const removeEspecifico = useCallback(
      (kind: EspecificoKind, uid: string) => {
         dispatch({
            type: "REMOVE_ESPECIFICO",
            payload: { localId, kind, uid },
         });
      },
      [dispatch, localId]
   );

   const updatePqd = useCallback(
      (uid: string, patch: Partial<DraftPqd>) => {
         dispatch({ type: "UPDATE_PQD", payload: { localId, uid, patch } });
      },
      [dispatch, localId]
   );

   const updateRevo = useCallback(
      (uid: string, patch: Partial<DraftRevo>) => {
         dispatch({ type: "UPDATE_REVO", payload: { localId, uid, patch } });
      },
      [dispatch, localId]
   );

   const updateHeavyCds = useCallback(
      (uid: string, patch: Partial<DraftHeavyCds>) => {
         dispatch({
            type: "UPDATE_HEAVY_CDS",
            payload: { localId, uid, patch },
         });
      },
      [dispatch, localId]
   );

   return {
      etapa,
      form: {
         formData,
         setField,
         tvoo,
         errors: liveErrors,
      },
      oi: {
         oiItems,
         addOiItem,
         removeOiItem,
         updateOiItem,
         oiTotalTvoo: oiTvooSum,
      },
      trips: {
         poolTrips,
         assignedTrips,
         assignedIds,
         removeAllFromFunc,
         removeFromGroup,
         updateFuncBordo,
         addTripToGroup,
      },
      especificos: {
         pqd: etapa.pqd,
         revo: etapa.revo,
         heavyCds: etapa.heavyCds,
         addEspecifico,
         removeEspecifico,
         updatePqd,
         updateRevo,
         updateHeavyCds,
      },
   };
}
