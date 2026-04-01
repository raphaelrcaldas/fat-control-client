"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
   Modal,
   ModalBody,
   ModalHeader,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Select,
   Spinner,
} from "flowbite-react";
import { MdFlightTakeoff } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import {
   useCreateEtapa,
   useUpdateEtapa,
   useEtapaDetail,
} from "@/hooks/queries/useEtapas";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { minutesToTime, formatTime } from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { SIM_ANV, MAX_PILOTOS, type DuplaPilot } from "../types";
import PilotSearchDropdown from "./PilotSearchDropdown";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface AddSessaoModalProps {
   show: boolean;
   onClose: () => void;
   missaoId: number;
   pilots: DuplaPilot[];
   editEtapa?: EtapaItem | null;
   onDelete?: (etapa: EtapaItem) => void;
}

function Field({
   id,
   label,
   children,
}: {
   id: string;
   label: string;
   children: React.ReactNode;
}) {
   return (
      <div className="flex flex-col gap-1">
         <Label htmlFor={id}>{label}</Label>
         {children}
      </div>
   );
}

function timeToMinutes(t: string): number {
   const [h, m] = t.split(":").map(Number);
   return (h || 0) * 60 + (m || 0);
}

function computeTvoo(dep: string, arr: string): number {
   if (!dep || !arr) return 0;
   const depMin = timeToMinutes(dep);
   let arrMin = timeToMinutes(arr);
   if (arrMin < depMin) arrMin += 1440;
   return arrMin - depMin;
}

interface SessionPilot {
   trip_id: number;
   trig: string;
   nome_guerra: string;
   p_g: string;
   func: string;
   func_bordo: string;
}

export default function AddSessaoModal({
   show,
   onClose,
   missaoId,
   pilots,
   editEtapa = null,
   onDelete,
}: AddSessaoModalProps) {
   const isEditMode = editEtapa !== null;
   const isOrphan = pilots.length === 0;
   const { push } = useToast();
   const createEtapa = useCreateEtapa();
   const updateEtapa = useUpdateEtapa();
   const { data: esfAerData, isLoading: loadingEsfAer } = useEsfAerList();
   const { data: tiposMissaoData, isLoading: loadingTipos } = useTiposMissao();

   // Fetch detail (has pousos) when editing
   const { data: etapaDetail, isLoading: loadingDetail } = useEtapaDetail(
      isEditMode ? editEtapa.id : null
   );

   // Form state
   const [data, setData] = useState("");
   const [origem, setOrigem] = useState("");
   const [destino, setDestino] = useState("");
   const [dep, setDep] = useState("");
   const [arr, setArr] = useState("");
   const [pousos, setPousos] = useState(0);
   const [reg, setReg] = useState<"d" | "n" | "v">("d");
   const [tipoMissaoId, setTipoMissaoId] = useState<number | null>(null);
   const [confirmDelete, setConfirmDelete] = useState(false);

   // ── Tripulação ───────────────────────────────────────────────────────
   const [sessionPilots, setSessionPilots] = useState<SessionPilot[]>([]);

   const addPilot = useCallback(
      (crew: {
         id: number;
         trig: string;
         nome_guerra: string;
         p_g: string;
      }) => {
         setSessionPilots((prev) => {
            if (prev.length >= 2) return prev;
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
      },
      []
   );

   const removePilot = useCallback((tripId: number) => {
      setSessionPilots((prev) => prev.filter((p) => p.trip_id !== tripId));
   }, []);

   const updateFuncBordo = useCallback((tripId: number, fb: string) => {
      setSessionPilots((prev) =>
         prev.map((p) => (p.trip_id === tripId ? { ...p, func_bordo: fb } : p))
      );
   }, []);

   // Find SML esforço aéreo
   const smlEsfAer = useMemo(
      () => (esfAerData ?? []).find((e) => e.descricao.includes("SML")),
      [esfAerData]
   );

   // Compute tvoo
   const tvoo = useMemo(() => computeTvoo(dep, arr), [dep, arr]);
   const tvooValid = tvoo >= 5 && tvoo % 5 === 0;

   // Set default tipo_missao when loaded (only for create mode)
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

   // Reset/populate form when modal opens
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
         // Populate pilots from etapa tripulantes
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
         // Pre-fill from dupla pilots with default func_bordo
         setSessionPilots(
            pilots.map((p, i) => ({
               ...p,
               func_bordo: i === 0 ? "1P" : "2P",
            }))
         );
      }
      setConfirmDelete(false);
   }, [show, isEditMode, editEtapa, tiposMissaoData, pilots]);

   // Populate pousos from detail when available (edit mode)
   useEffect(() => {
      if (isEditMode && etapaDetail) {
         setPousos(etapaDetail.pousos);
      }
   }, [isEditMode, etapaDetail]);

   const isPending = createEtapa.isPending || updateEtapa.isPending;

   const canSubmit =
      data &&
      origem.length === 4 &&
      destino.length === 4 &&
      dep &&
      arr &&
      tvooValid &&
      tipoMissaoId &&
      smlEsfAer &&
      sessionPilots.length > 0 &&
      !isPending;

   async function handleSubmit(e: React.FormEvent) {
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

      try {
         if (isEditMode) {
            const res = await updateEtapa.mutateAsync({
               id: editEtapa.id,
               data: {
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
               },
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
   }

   const isLoading =
      loadingEsfAer || loadingTipos || (isEditMode && loadingDetail);

   const tvooColor =
      !dep || !arr
         ? "border-gray-200 bg-gray-50 text-gray-400"
         : tvooValid
           ? "border-green-200 bg-green-50 text-green-700"
           : "border-amber-200 bg-amber-50 text-amber-700";

   const pilotNames =
      sessionPilots.length > 0
         ? sessionPilots
              .map((p) => `${p.p_g} ${p.nome_guerra}`)
              .join(" / ")
              .toUpperCase()
         : "Sem pilotos";

   return (
      <>
         <Modal show={show} size="2xl" onClose={onClose} dismissible>
            <ModalHeader>
               <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
                     <MdFlightTakeoff className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <p className="text-base font-semibold text-gray-900">
                        {isEditMode
                           ? "Editar Sessão"
                           : "Nova Sessão de Simulador"}
                     </p>
                     <p className="text-sm font-normal text-gray-400">
                        {pilotNames}
                     </p>
                  </div>
               </div>
            </ModalHeader>

            <ModalBody>
               {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                     <Spinner size="lg" color="failure" />
                  </div>
               ) : (
                  <form
                     id="sessao-form"
                     onSubmit={handleSubmit}
                     className="space-y-5"
                  >
                     {/* ── Tripulação ─────────────────────────────── */}
                     <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                        <div className="mb-3 flex items-center justify-between">
                           <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                              {sessionPilots.length} / {MAX_PILOTOS}
                           </span>
                        </div>

                        <PilotSearchDropdown
                           pilots={sessionPilots}
                           onAdd={addPilot}
                           onRemove={removePilot}
                           onUpdateFuncBordo={updateFuncBordo}
                           showSearch={isOrphan || isEditMode}
                        />
                     </div>

                     {/* ── Dados da Sessão ────────────────────────── */}
                     <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                           <Field id="ses-data" label="Data">
                              <TextInput
                                 id="ses-data"
                                 type="date"
                                 value={data}
                                 onChange={(e) => setData(e.target.value)}
                                 sizing="sm"
                                 required
                              />
                           </Field>
                           <Field id="ses-origem" label="Origem">
                              <TextInput
                                 id="ses-origem"
                                 placeholder="ICAO"
                                 value={origem}
                                 onChange={(e) =>
                                    setOrigem(
                                       e.target.value.slice(0, 4).toUpperCase()
                                    )
                                 }
                                 sizing="sm"
                                 maxLength={4}
                                 className="uppercase"
                                 required
                              />
                           </Field>
                           <Field id="ses-destino" label="Destino">
                              <TextInput
                                 id="ses-destino"
                                 placeholder="ICAO"
                                 value={destino}
                                 onChange={(e) =>
                                    setDestino(
                                       e.target.value.slice(0, 4).toUpperCase()
                                    )
                                 }
                                 sizing="sm"
                                 maxLength={4}
                                 className="uppercase"
                                 required
                              />
                           </Field>
                           <Field id="ses-pousos" label="Pousos">
                              <TextInput
                                 id="ses-pousos"
                                 type="number"
                                 value={pousos}
                                 onChange={(e) =>
                                    setPousos(
                                       Math.max(0, Number(e.target.value))
                                    )
                                 }
                                 sizing="sm"
                                 min={0}
                              />
                           </Field>
                        </div>

                        {/* DEP / ARR / T.Voo */}
                        <div className="mt-3 grid grid-cols-3 gap-3">
                           <Field id="ses-dep" label="DEP">
                              <TextInput
                                 id="ses-dep"
                                 type="time"
                                 value={dep}
                                 onChange={(e) => setDep(e.target.value)}
                                 sizing="sm"
                                 required
                              />
                           </Field>
                           <Field id="ses-arr" label="ARR">
                              <TextInput
                                 id="ses-arr"
                                 type="time"
                                 value={arr}
                                 onChange={(e) => setArr(e.target.value)}
                                 sizing="sm"
                                 required
                              />
                           </Field>
                           <div className="flex flex-col gap-1">
                              <Label>T.Voo</Label>
                              <div
                                 className={`flex items-center justify-center rounded-lg border px-3 py-1.5 font-mono text-sm font-bold ${tvooColor}`}
                              >
                                 {dep && arr ? minutesToTime(tvoo) : "—"}
                              </div>
                              {dep && arr && !tvooValid && tvoo > 0 && (
                                 <span className="text-xs text-amber-600">
                                    Múltiplo de 5 min
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* ── Ordem de Instrução ─────────────────────── */}
                     <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                           <Field id="ses-tipo-missao" label="Tipo de Missão">
                              <Select
                                 id="ses-tipo-missao"
                                 value={tipoMissaoId ?? ""}
                                 onChange={(e) =>
                                    setTipoMissaoId(Number(e.target.value))
                                 }
                                 sizing="sm"
                              >
                                 {(tiposMissaoData ?? []).map((t) => (
                                    <option key={t.id} value={t.id}>
                                       {t.cod} — {t.desc}
                                    </option>
                                 ))}
                              </Select>
                           </Field>
                           <Field id="ses-reg" label="Regime">
                              <Select
                                 id="ses-reg"
                                 value={reg}
                                 onChange={(e) =>
                                    setReg(e.target.value as "d" | "n" | "v")
                                 }
                                 sizing="sm"
                              >
                                 <option value="d">Diurno</option>
                                 <option value="n">Noturno</option>
                                 <option value="v">NVG</option>
                              </Select>
                           </Field>
                        </div>
                        {smlEsfAer && (
                           <p className="mt-2 text-xs text-gray-400">
                              Esforço Aéreo:{" "}
                              <span className="font-mono font-medium text-gray-600">
                                 {smlEsfAer.descricao}
                              </span>
                           </p>
                        )}
                     </div>
                  </form>
               )}
            </ModalBody>

            {!isLoading && (
               <ModalFooter>
                  <div className="flex w-full items-center">
                     {isEditMode && onDelete && (
                        <Button
                           color="red"
                           size="sm"
                           onClick={() => setConfirmDelete(true)}
                        >
                           Excluir Sessão
                        </Button>
                     )}
                     <div className="ml-auto flex gap-2">
                        <Button color="gray" onClick={onClose}>
                           Cancelar
                        </Button>
                        <Button
                           type="submit"
                           form="sessao-form"
                           color="blue"
                           disabled={!canSubmit}
                        >
                           {isPending
                              ? "Salvando..."
                              : isEditMode
                                ? "Salvar Alterações"
                                : "Criar Sessão"}
                        </Button>
                     </div>
                  </div>
               </ModalFooter>
            )}
         </Modal>

         <ConfirmDeleteModal
            show={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() => {
               if (onDelete && editEtapa) onDelete(editEtapa);
               setConfirmDelete(false);
            }}
         />
      </>
   );
}
