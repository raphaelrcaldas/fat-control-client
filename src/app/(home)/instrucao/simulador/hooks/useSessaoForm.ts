import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/app/context/toast";
import {
   useCreateEtapa,
   useUpdateEtapa,
   useEtapaDetail,
} from "@/hooks/queries/useEtapas";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { formatTime } from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { computeTvoo } from "../helpers/tvoo";
import {
   SIM_ANV,
   MAX_PILOTOS,
   type DuplaPilot,
   type CrewSearchResult,
} from "../types";

interface UseSessaoFormArgs {
   show: boolean;
   missaoId: number;
   pilots: DuplaPilot[];
   editEtapa: EtapaItem | null;
   onClose: () => void;
}

/**
 * Concentra todo o estado, validação e submit do formulário de sessão de
 * simulador (criar/editar). O componente fica apenas com a apresentação.
 */
export function useSessaoForm({
   show,
   missaoId,
   pilots,
   editEtapa,
   onClose,
}: UseSessaoFormArgs) {
   const isEditMode = editEtapa !== null;
   const { push } = useToast();
   const createEtapa = useCreateEtapa();
   const updateEtapa = useUpdateEtapa();
   const { data: esfAerData, isLoading: loadingEsfAer } = useEsfAerList();
   const { data: tiposMissaoData, isLoading: loadingTipos } = useTiposMissao();
   const { data: etapaDetail, isLoading: loadingDetail } = useEtapaDetail(
      isEditMode ? editEtapa.id : null
   );

   // Estado do formulário
   const [data, setData] = useState("");
   const [origem, setOrigem] = useState("");
   const [destino, setDestino] = useState("");
   const [dep, setDep] = useState("");
   const [arr, setArr] = useState("");
   const [pousos, setPousos] = useState(0);
   const [reg, setReg] = useState<"d" | "n" | "v">("d");
   const [tipoMissaoId, setTipoMissaoId] = useState<number | null>(null);
   const [sessionPilots, setSessionPilots] = useState<DuplaPilot[]>([]);

   const addPilot = useCallback((crew: CrewSearchResult) => {
      setSessionPilots((prev) => {
         if (prev.length >= MAX_PILOTOS) return prev;
         return [
            ...prev,
            {
               trip_id: crew.id,
               trig: crew.trig,
               nome_guerra: crew.nome_guerra,
               p_g: crew.p_g,
               func: "pil",
               func_bordo: prev.length === 0 ? "1P" : "2P",
            },
         ];
      });
   }, []);

   const removePilot = useCallback((tripId: number) => {
      setSessionPilots((prev) => prev.filter((p) => p.trip_id !== tripId));
   }, []);

   const updateFuncBordo = useCallback((tripId: number, fb: string) => {
      setSessionPilots((prev) =>
         prev.map((p) => (p.trip_id === tripId ? { ...p, func_bordo: fb } : p))
      );
   }, []);

   // Esforço aéreo SML (fixo do simulador)
   const smlEsfAer = useMemo(
      () => (esfAerData ?? []).find((e) => e.descricao.includes("SML")),
      [esfAerData]
   );

   const tvoo = useMemo(() => computeTvoo(dep, arr), [dep, arr]);
   const tvooValid = tvoo >= 5 && tvoo % 5 === 0;
   const crossesDay = !!dep && !!arr && tvoo === 0;

   // Default de tipo de missão (apenas criação)
   useEffect(() => {
      if (
         tiposMissaoData &&
         tiposMissaoData.length > 0 &&
         !tipoMissaoId &&
         !isEditMode
      ) {
         setTipoMissaoId(tiposMissaoData[0].id);
      }
   }, [tiposMissaoData, tipoMissaoId, isEditMode]);

   // Popula / reseta o formulário ao abrir
   useEffect(() => {
      if (!show) return;

      if (isEditMode) {
         setData(editEtapa.data);
         setOrigem(editEtapa.origem);
         setDestino(editEtapa.destino);
         setDep(formatTime(editEtapa.dep));
         setArr(formatTime(editEtapa.arr));
         setReg(editEtapa.oi_etapas[0]?.reg ?? "d");
         setTipoMissaoId(editEtapa.oi_etapas[0]?.tipo_missao_id ?? null);
         setSessionPilots(
            editEtapa.tripulantes.map((t) => ({
               trip_id: t.trip_id,
               trig: t.trig,
               nome_guerra: t.nome_guerra,
               p_g: t.p_g,
               func: t.func,
               func_bordo: t.func_bordo,
            }))
         );
      } else {
         setData("");
         setOrigem("");
         setDestino("");
         setDep("");
         setArr("");
         setPousos(0);
         setReg("d");
         setTipoMissaoId(tiposMissaoData?.[0]?.id ?? null);
         setSessionPilots(
            pilots.map((p, i) => ({ ...p, func_bordo: i === 0 ? "1P" : "2P" }))
         );
      }
   }, [show, isEditMode, editEtapa, tiposMissaoData, pilots]);

   // Pousos vêm do detalhe (modo edição)
   useEffect(() => {
      if (isEditMode && etapaDetail) setPousos(etapaDetail.pousos);
   }, [isEditMode, etapaDetail]);

   const isPending = createEtapa.isPending || updateEtapa.isPending;
   const isLoadingData =
      loadingEsfAer || loadingTipos || (isEditMode && loadingDetail);

   const canSubmit = Boolean(
      data &&
      origem.length === 4 &&
      destino.length === 4 &&
      dep &&
      arr &&
      tvooValid &&
      tipoMissaoId &&
      smlEsfAer &&
      sessionPilots.length > 0 &&
      !isPending
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
         e.preventDefault();
         if (!canSubmit) return;

         const tripulantes = sessionPilots.map((p) => ({
            trip_id: p.trip_id,
            func: p.func,
            func_bordo: p.func_bordo,
         }));
         const oiEtapas = [
            {
               esf_aer_id: smlEsfAer!.id,
               tipo_missao_id: tipoMissaoId!,
               reg,
               tvoo,
            },
         ];
         const payload = {
            data,
            origem: origem.toUpperCase(),
            destino: destino.toUpperCase(),
            dep: dep.length === 5 ? `${dep}:00` : dep,
            arr: arr.length === 5 ? `${arr}:00` : arr,
            tvoo,
            anv: SIM_ANV,
            pousos,
            sagem: false,
            parte1: false,
            obs: null,
            tripulantes,
            oi_etapas: oiEtapas,
         };

         try {
            if (isEditMode) {
               const res = await updateEtapa.mutateAsync({
                  id: editEtapa.id,
                  data: payload,
               });
               push({
                  title: res.ok ? "Sucesso!" : "Erro",
                  message: res.message ?? "Sessão atualizada",
                  type: res.ok ? "success" : "error",
               });
               if (res.ok) onClose();
            } else {
               const res = await createEtapa.mutateAsync({
                  missao_id: missaoId,
                  ...payload,
               });
               push({
                  title: res.ok ? "Sucesso!" : "Erro",
                  message: res.message ?? "Sessão criada",
                  type: res.ok ? "success" : "error",
               });
               if (res.ok) onClose();
            }
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error
                     ? err.message
                     : `Erro ao ${isEditMode ? "atualizar" : "criar"} sessão`,
               type: "error",
            });
         }
      },
      [
         canSubmit,
         sessionPilots,
         smlEsfAer,
         tipoMissaoId,
         reg,
         tvoo,
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         isEditMode,
         editEtapa,
         missaoId,
         updateEtapa,
         createEtapa,
         push,
         onClose,
      ]
   );

   return {
      isEditMode,
      data,
      setData,
      origem,
      setOrigem,
      destino,
      setDestino,
      dep,
      setDep,
      arr,
      setArr,
      pousos,
      setPousos,
      reg,
      setReg,
      tipoMissaoId,
      setTipoMissaoId,
      sessionPilots,
      addPilot,
      removePilot,
      updateFuncBordo,
      smlEsfAer,
      tiposMissaoData,
      tvoo,
      tvooValid,
      crossesDay,
      canSubmit,
      isPending,
      isLoadingData,
      handleSubmit,
   };
}

export type SessaoForm = ReturnType<typeof useSessaoForm>;
