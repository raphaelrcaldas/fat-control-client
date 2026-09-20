import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "@/app/context/toast";
import {
   useCreateEtapa,
   useUpdateEtapa,
   useCreateMissaoWithEtapas,
} from "@/hooks/queries/useEtapas";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { computeTvoo } from "../helpers/tvoo";
import {
   createSessaoDraft,
   serializeSessaoDraft,
   type SessaoDraft,
} from "../helpers/sessaoDraft";
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
   /** Observacao da missao, usada so na criacao de um draft. */
   obs?: string | null;
   onClose: () => void;
   /** Chamado com o id real quando a 1ª sessao de um draft cria a missao. */
   onPersistDraft?: (newMissaoId: number) => void;
   /** Chamado depois de persistir uma sessao existente ou nova. */
   onSaved?: (etapaId: number) => void;
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
   obs = null,
   onClose,
   onPersistDraft,
   onSaved,
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
   const [savedDraft, setSavedDraft] = useState<SessaoDraft | null>(null);

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

      const initial = createSessaoDraft(editEtapa, pilots);
      setSavedDraft(initial);
      setData(initial.data);
      setOrigem(initial.origem);
      setDestino(initial.destino);
      setDep(initial.dep);
      setArr(initial.arr);
      setPousos(initial.pousos);
      setReg(initial.reg);
      setTipoMissaoId(initial.tipoMissaoId ?? tiposMissaoData?.[0]?.id ?? null);
      setSessionPilots(initial.sessionPilots);
   }, [show, isEditMode, editEtapa, tiposMissaoData, pilots]);

   const draft = useMemo<SessaoDraft>(
      () => ({
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         reg,
         tipoMissaoId,
         sessionPilots,
      }),
      [
         data,
         origem,
         destino,
         dep,
         arr,
         pousos,
         reg,
         tipoMissaoId,
         sessionPilots,
      ]
   );
   const defaultTipoMissaoId = tiposMissaoData?.[0]?.id ?? null;
   const isDirty =
      savedDraft !== null &&
      serializeSessaoDraft(draft, defaultTipoMissaoId) !==
         serializeSessaoDraft(savedDraft, defaultTipoMissaoId);
   const preview = useMemo(
      () => ({ data, origem, destino, dep, arr, tvoo }),
      [data, origem, destino, dep, arr, tvoo]
   );

   const isPending =
      createEtapa.isPending ||
      updateEtapa.isPending ||
      createMissaoWithEtapas.isPending;
   const isLoadingData = loadingEsfAer || loadingTipos;

   const canSubmit = Boolean(
      isDirty &&
      data &&
      !dateOutOfYear &&
      origem.length === 4 &&
      destino.length === 4 &&
      dep &&
      arr &&
      tvooValid &&
      // Cinto e suspensorio: o campo ja sanitiza, mas NaN aqui viraria
      // `null` no JSON e 422 generico do backend.
      Number.isInteger(pousos) &&
      pousos >= 0 &&
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
               if (res.ok) {
                  setSavedDraft(draft);
                  onSaved?.(res.data?.id ?? editEtapa.id);
                  onClose();
               }
            } else if (isDraft) {
               const res = await createMissaoWithEtapas.mutateAsync({
                  titulo: "Simulador",
                  obs,
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
                  setSavedDraft(draft);
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
               if (res.ok) {
                  setSavedDraft(draft);
                  if (res.data) onSaved?.(res.data.id);
                  onClose();
               }
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
         draft,
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
         obs,
         editEtapa,
         missaoId,
         updateEtapa,
         createEtapa,
         createMissaoWithEtapas,
         onPersistDraft,
         onSaved,
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
      isDirty,
      preview,
      isPending,
      isLoadingData,
      handleSubmit,
      anoRef,
   };
}

export type SessaoForm = ReturnType<typeof useSessaoForm>;
