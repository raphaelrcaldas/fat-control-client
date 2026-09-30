import type { Dispatch, RefObject, SetStateAction } from "react";
import type {
   DraftEtapa,
   EtapaFormData,
} from "@/app/(home)/estatistica/etapas/missao/context/types";
import type { SimuladorAction } from "./simuladorReducer";
import type { SessaoOrdemForm } from "../../components/SessaoOrdemInstrucaoFields";
import { computeTvoo } from "../../helpers/tvoo";
import { sortPilotos } from "../../helpers/sessoes";
import { MAX_PILOTOS, type CrewSearchResult } from "../../types";

type Catalogos = Pick<
   SessaoOrdemForm,
   | "tiposMissaoData"
   | "smlEsfAer"
   | "isDataError"
   | "dataErrorMessage"
   | "retryLoadingData"
   | "isRefetchingData"
> & { isLoadingData: boolean };

/** Adapta a etapa do rascunho compartilhado aos controles do simulador. */
export function createSimuladorEtapaForm({
   etapa,
   dispatch,
   savingRef,
   anoRef,
   catalogs,
}: {
   etapa: DraftEtapa;
   dispatch: Dispatch<SimuladorAction>;
   savingRef: RefObject<boolean>;
   /** Ano original da sessão persistida; `null` (sessão nova) = qualquer ano. */
   anoRef: number | null;
   catalogs: Catalogos;
}) {
   const {
      smlEsfAer,
      isLoadingData,
      isDataError,
      dataErrorMessage,
      retryLoadingData,
   } = catalogs;
   const setField =
      <K extends keyof EtapaFormData>(field: K) =>
      (value: SetStateAction<EtapaFormData[K]>) => {
         if (savingRef.current) return;
         dispatch({
            type: "UPDATE_ETAPA_FORM",
            payload: {
               localId: etapa.localId,
               patch: {
                  [field]:
                     typeof value === "function"
                        ? value(etapa.form[field])
                        : value,
               },
            },
         });
      };
   const oi = etapa.oiItems[0];
   const setOi = (patch: {
      reg?: "d" | "n" | "v";
      tipo_missao_id?: number | null;
   }) => {
      if (savingRef.current) return;
      // A OI única do simulador é alterada por ações granulares do reducer:
      // reescrever o rascunho inteiro com o `draft` do render descartaria
      // edições feitas em outras sessões entre o render e o evento.
      if (oi) {
         dispatch({
            type: "UPDATE_OI",
            payload: { localId: etapa.localId, uid: oi.uid, patch },
         });
         return;
      }
      // Sessão legada sem OI: nasce já no padrão do simulador, como o
      // salvamento faria.
      dispatch({
         type: "ADD_OI_WITH",
         payload: {
            localId: etapa.localId,
            patch: {
               esf_aer_id: smlEsfAer?.id ?? null,
               tipo_missao_id: catalogs.tiposMissaoData?.[0]?.id ?? null,
               reg: "d",
               tvoo: computeTvoo(etapa.form.dep, etapa.form.arr),
               ...patch,
            },
         },
      });
   };
   const tvoo = computeTvoo(etapa.form.dep, etapa.form.arr);
   const depArrEqual =
      !!etapa.form.dep && !!etapa.form.arr && etapa.form.dep === etapa.form.arr;
   const sessionPilots = sortPilotos(
      etapa.assignedTrips.map((p) => ({
         trip_id: p.tripId,
         trig: p.trig,
         nome_guerra: p.nomeGuerra,
         p_g: p.pGraduacao,
         func: p.func,
         func_bordo: p.funcBordo,
         ant: p.ant,
         ult_promo: p.ult_promo,
         ant_rel: p.ant_rel,
      }))
   );
   return {
      ...etapa.form,
      setData: setField("data"),
      setOrigem: setField("origem"),
      setDestino: setField("destino"),
      setDep: setField("dep"),
      setArr: setField("arr"),
      setPousos: setField("pousos"),
      setSagem: setField("sagem"),
      setParte1: setField("parte1"),
      sessionPilots,
      addPilot: (crew: CrewSearchResult) => {
         if (
            savingRef.current ||
            etapa.assignedTrips.length >= MAX_PILOTOS ||
            etapa.assignedTrips.some((p) => p.tripId === crew.id)
         )
            return;
         dispatch({
            type: "ADD_TRIP",
            payload: {
               localId: etapa.localId,
               trip: {
                  tripId: crew.id,
                  trig: crew.trig,
                  nomeGuerra: crew.nome_guerra,
                  pGraduacao: crew.p_g,
                  func: "pil",
                  ant: crew.ant,
                  ult_promo: crew.ult_promo,
                  ant_rel: crew.ant_rel,
                  funcBordo: etapa.assignedTrips.length === 0 ? "1P" : "2P",
               },
            },
         });
      },
      removePilot: (tripId: number) => {
         if (savingRef.current) return;
         dispatch({
            type: "REMOVE_TRIP",
            payload: { localId: etapa.localId, tripId },
         });
      },
      updateFuncBordo: (tripId: number, funcBordo: string) => {
         if (savingRef.current) return;
         dispatch({
            type: "UPDATE_FUNC_BORDO",
            payload: { localId: etapa.localId, tripId, funcBordo },
         });
      },
      tipoMissaoId:
         oi?.tipo_missao_id ?? catalogs.tiposMissaoData?.[0]?.id ?? null,
      setTipoMissaoId: (value: SetStateAction<number | null>) =>
         setOi({
            tipo_missao_id:
               typeof value === "function"
                  ? value(oi?.tipo_missao_id ?? null)
                  : value,
         }),
      reg: oi?.reg ?? "d",
      setReg: (value: SetStateAction<"d" | "n" | "v">) =>
         setOi({
            reg: typeof value === "function" ? value(oi?.reg ?? "d") : value,
         }),
      tiposMissaoData: catalogs.tiposMissaoData,
      smlEsfAer,
      tvoo,
      tvooValid: tvoo >= 5 && tvoo % 5 === 0,
      depArrEqual,
      crossesDay:
         !!etapa.form.dep && !!etapa.form.arr && !depArrEqual && tvoo === 0,
      dateOutOfYear:
         anoRef !== null &&
         !!etapa.form.data &&
         etapa.form.data.slice(0, 4) !== String(anoRef),
      anoRef,
      isLoadingData,
      isDataError,
      dataErrorMessage,
      retryLoadingData,
      isRefetchingData: catalogs.isRefetchingData,
   };
}
