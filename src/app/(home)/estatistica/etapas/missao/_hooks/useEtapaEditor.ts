"use client";

import { useCallback, useMemo } from "react";

import {
   getPosicoesByFunc,
   type FuncType,
} from "@/constants/tripulantes/funcoes";

import {
   useMissaoDraft,
   useMissaoDraftDispatch,
} from "../_state/MissaoDraftContext";
import {
   buildPoolFromDraft,
   calcTvoo,
   selectEspecificosValid,
   selectEtapaTotals,
} from "../_state/helpers";
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
} from "../_state/types";

const FIELD_LIMITS = {
   pousos: { min: 0, max: 20, label: "Pousos" },
   tow: { min: 52000, max: 87000, label: "TOW" },
   pax: { min: 0, max: 84, label: "PAX" },
   carga: { min: 0, max: 30000, label: "Carga" },
   comb: { min: 1, max: 32767, label: "Combustível" },
   lub: { min: 0, max: 99.9, label: "Lubrificante" },
} as const;

type LimitKey = keyof typeof FIELD_LIMITS;
type FormErrors = Partial<Record<keyof EtapaFormData, string>>;

interface AddTripInput {
   id?: number;
   trig: string;
   user: { nome_guerra: string; p_g: string };
}

export interface UseEtapaEditorResult {
   etapa: DraftEtapa;

   // Form
   formData: EtapaFormData;
   setField: <K extends keyof EtapaFormData>(
      key: K,
      value: EtapaFormData[K]
   ) => void;
   tvoo: number;
   tvooValid: boolean;
   crossesDay: boolean;
   errors: FormErrors;

   // OIs
   oiItems: DraftOIItem[];
   addOiItem: () => void;
   removeOiItem: (uid: string) => void;
   updateOiItem: (uid: string, patch: Partial<DraftOIItem>) => void;
   oiTotalTvoo: number;
   oiValid: boolean;

   // Tripulantes
   poolTrips: DraftPoolTrip[];
   assignedTrips: DraftAssignedTrip[];
   assignedIds: Set<number>;
   removeAllFromFunc: (func: FuncType) => void;
   removeFromGroup: (tripId: number) => void;
   updateFuncBordo: (tripId: number, funcBordo: string) => void;
   addTripToGroup: (trip: AddTripInput, func: FuncType) => void;

   // Especificos
   pqd: DraftPqd[];
   revo: DraftRevo[];
   heavyCds: DraftHeavyCds[];
   addEspecifico: (kind: EspecificoKind) => void;
   removeEspecifico: (kind: EspecificoKind, uid: string) => void;
   updatePqd: (uid: string, patch: Partial<DraftPqd>) => void;
   updateRevo: (uid: string, patch: Partial<DraftRevo>) => void;
   updateHeavyCds: (uid: string, patch: Partial<DraftHeavyCds>) => void;

   // Validation
   validate: () => boolean;
}

function deriveErrors(
   form: EtapaFormData,
   tvoo: number,
   crossesDay: boolean
): FormErrors {
   const errs: FormErrors = {};

   if (form.dep && form.arr && crossesDay) {
      errs.arr = "Etapa nao pode atravessar o dia. Use 00:00 como fim do dia.";
   }

   for (const key of Object.keys(FIELD_LIMITS) as LimitKey[]) {
      const val = form[key];
      if (val == null) continue;
      const num = Number(val);
      if (Number.isNaN(num)) continue;
      const { min, max, label } = FIELD_LIMITS[key];
      if (num < min) {
         errs[key] = `${label} deve ser no mínimo ${min}`;
      } else if (num > max) {
         errs[key] =
            `${label} deve ser no máximo ${max.toLocaleString("pt-BR")}`;
      }
   }

   void tvoo;
   return errs;
}

export function useEtapaEditor(localId: string): UseEtapaEditorResult {
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
   const crossesDay = !!formData.dep && !!formData.arr && tvoo === 0;
   const tvooValid = tvoo > 0 && tvoo % 5 === 0;

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
      () => deriveErrors(formData, tvoo, crossesDay),
      [formData, tvoo, crossesDay]
   );

   // OI totals — selectEtapaTotals encapsulates the canonical rule
   const { oiTvooSum, oiValid } = useMemo(
      () => selectEtapaTotals(etapa),
      [etapa]
   );

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

         const posicoes = getPosicoesByFunc(func);
         const defaultFuncBordo =
            posicoes[0]?.codigo ?? func.toUpperCase().slice(0, 2);

         const assigned: DraftAssignedTrip = {
            tripId,
            trig: trip.trig,
            nomeGuerra: trip.user.nome_guerra,
            pGraduacao: trip.user.p_g,
            func,
            funcBordo: defaultFuncBordo,
         };

         dispatch({
            type: "ADD_TRIP",
            payload: { localId, trip: assigned },
         });
      },
      [assignedIds, dispatch, localId]
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

   // Imperative validation (mirrors original useEtapaForm.validate())
   const validate = useCallback((): boolean => {
      const errs: FormErrors = { ...liveErrors };
      if (!formData.data) errs.data = "Informe a data";
      if (!formData.origem || formData.origem.length !== 4)
         errs.origem = "Codigo ICAO deve ter 4 caracteres";
      if (!formData.destino || formData.destino.length !== 4)
         errs.destino = "Codigo ICAO deve ter 4 caracteres";
      if (!formData.dep) errs.dep = "Informe a hora de decolagem";
      if (!formData.arr) errs.arr = "Informe a hora de pouso";
      else if (crossesDay)
         errs.arr =
            "Etapa nao pode atravessar o dia. Use 00:00 como fim do dia.";
      if (!formData.anv) errs.anv = "Selecione a aeronave";

      const baseOk = Object.keys(errs).length === 0;
      return baseOk && tvooValid && oiValid && selectEspecificosValid(etapa);
   }, [crossesDay, etapa, formData, liveErrors, oiValid, tvooValid]);

   return {
      etapa,
      formData,
      setField,
      tvoo,
      tvooValid,
      crossesDay,
      errors: liveErrors,
      oiItems,
      addOiItem,
      removeOiItem,
      updateOiItem,
      oiTotalTvoo: oiTvooSum,
      oiValid,
      poolTrips,
      assignedTrips,
      assignedIds,
      removeAllFromFunc,
      removeFromGroup,
      updateFuncBordo,
      addTripToGroup,
      pqd: etapa.pqd,
      revo: etapa.revo,
      heavyCds: etapa.heavyCds,
      addEspecifico,
      removeEspecifico,
      updatePqd,
      updateRevo,
      updateHeavyCds,
      validate,
   };
}
