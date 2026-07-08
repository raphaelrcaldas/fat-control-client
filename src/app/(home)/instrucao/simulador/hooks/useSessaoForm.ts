import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "@/app/context/toast";
import {
   useCreateEtapa,
   useUpdateEtapa,
   useCreateMissaoWithEtapas,
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
   /** Negativo = dupla ainda em draft (missao criada junto da 1ª sessao). */
   missaoId: number;
   /** Ano de referencia da tela — a sessao deve cair dentro dele. */
   anoRef: number;
   pilots: DuplaPilot[];
   editEtapa: EtapaItem | null;
   onClose: () => void;
   /** Chamado com o id real quando a 1ª sessao de um draft cria a missao. */
   onPersistDraft?: (newMissaoId: number) => void;
}

/**
 * Concentra todo o estado, validação e submit do formulário de sessão de
 * simulador (criar/editar). O componente fica apenas com a apresentação.
 */
export function useSessaoForm({
   show,
   missaoId,
   anoRef,
   pilots,
   editEtapa,
   onClose,
   onPersistDraft,
}: UseSessaoFormArgs) {
   const isEditMode = editEtapa !== null;
   // Draft: dupla local sem missao no banco; a 1ª sessao cria missao + etapa.
   const isDraft = !isEditMode && missaoId < 0;
   const { push } = useToast();
   const createEtapa = useCreateEtapa();
   const updateEtapa = useUpdateEtapa();
   const createMissaoWithEtapas = useCreateMissaoWithEtapas();
   const { data: esfAerData, isLoading: loadingEsfAer } = useEsfAerList();
   const { data: tiposMissaoData, isLoading: loadingTipos } = useTiposMissao();

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
   // DEP == ARR (duração zero) é diferente de "atravessa o dia" (ARR < DEP).
   const depArrEqual = !!dep && !!arr && dep === arr;
   const crossesDay = !!dep && !!arr && !depArrEqual && tvoo === 0;
   // A sessão precisa cair dentro do ano de referência exibido na tela; senão
   // some da listagem (filtro data_ini/data_fim) e parece que não foi salva.
   const dateOutOfYear = !!data && data.slice(0, 4) !== String(anoRef);

   // Default de tipo de missão quando nenhum está selecionado (criação ou
   // edição de etapa legada sem OI) — garante um valor válido para submeter.
   useEffect(() => {
      if (tiposMissaoData && tiposMissaoData.length > 0 && !tipoMissaoId) {
         setTipoMissaoId(tiposMissaoData[0].id);
      }
   }, [tiposMissaoData, tipoMissaoId]);

   // Popula / reseta o formulário. Roda apenas na ABERTURA e ao trocar a etapa
   // alvo — não a cada refetch (que muda `pilots`/`tiposMissaoData`), o que
   // apagaria o que o usuário está digitando com o modal aberto.
   const initKeyRef = useRef<string | null>(null);
   useEffect(() => {
      if (!show) {
         initKeyRef.current = null;
         return;
      }
      const key = isEditMode ? `edit-${editEtapa.id}` : "new";
      if (initKeyRef.current === key) return;
      initKeyRef.current = key;

      if (isEditMode) {
         setData(editEtapa.data);
         setOrigem(editEtapa.origem);
         setDestino(editEtapa.destino);
         setDep(formatTime(editEtapa.dep));
         setArr(formatTime(editEtapa.arr));
         setPousos(editEtapa.pousos);
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

   const isPending =
      createEtapa.isPending ||
      updateEtapa.isPending ||
      createMissaoWithEtapas.isPending;
   const isLoadingData = loadingEsfAer || loadingTipos;

   const canSubmit = Boolean(
      data &&
      !dateOutOfYear &&
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
         // Campos comuns a criar/editar. sagem/parte1/obs ficam de fora: na
         // edição, enviá-los sobrescreveria (o backend usa exclude_unset); na
         // criação, são adicionados explicitamente abaixo.
         const commonPayload = {
            data,
            origem: origem.toUpperCase(),
            destino: destino.toUpperCase(),
            dep: dep.length === 5 ? `${dep}:00` : dep,
            arr: arr.length === 5 ? `${arr}:00` : arr,
            tvoo,
            anv: SIM_ANV,
            pousos,
            tripulantes,
            oi_etapas: oiEtapas,
         };

         try {
            if (isEditMode) {
               const res = await updateEtapa.mutateAsync({
                  id: editEtapa.id,
                  data: commonPayload,
               });
               push({
                  title: res.ok ? "Sucesso!" : "Erro",
                  message: res.message ?? "Sessão atualizada",
                  type: res.ok ? "success" : "error",
               });
               if (res.ok) onClose();
            } else if (isDraft) {
               const res = await createMissaoWithEtapas.mutateAsync({
                  titulo: "Simulador",
                  obs: null,
                  is_simulador: true,
                  etapas: [
                     {
                        ...commonPayload,
                        tow: null,
                        pax: null,
                        carga: null,
                        comb: null,
                        lub: null,
                        nivel: null,
                        sagem: false,
                        parte1: false,
                        obs: null,
                        pqd: [],
                        revo: [],
                        heavy_cds: [],
                     },
                  ],
               });
               push({
                  title: res.ok ? "Sucesso!" : "Erro",
                  message: res.message ?? "Dupla e sessão criadas",
                  type: res.ok ? "success" : "error",
               });
               if (res.ok && res.data) {
                  onPersistDraft?.(res.data.id);
                  onClose();
               }
            } else {
               const res = await createEtapa.mutateAsync({
                  missao_id: missaoId,
                  ...commonPayload,
                  sagem: false,
                  parte1: false,
                  obs: null,
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
         isDraft,
         editEtapa,
         missaoId,
         updateEtapa,
         createEtapa,
         createMissaoWithEtapas,
         onPersistDraft,
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
      depArrEqual,
      dateOutOfYear,
      canSubmit,
      isPending,
      isLoadingData,
      handleSubmit,
   };
}

export type SessaoForm = ReturnType<typeof useSessaoForm>;
