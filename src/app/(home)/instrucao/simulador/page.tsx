"use client";

import { useState, useCallback } from "react";
import { Alert, Button, Label, Select, Spinner } from "flowbite-react";
import { MdFlightTakeoff, MdDelete } from "react-icons/md";
import { HiPlus } from "react-icons/hi";
import {
   useDeleteEtapa,
   useDeleteEstatMissao,
} from "@/hooks/queries/useEtapas";
import { useToast } from "@/app/context/toast";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { Dupla } from "./types";
import { useSimuladorDuplas } from "./hooks/useSimuladorDuplas";
import DuplasSidebar from "./components/DuplasSidebar";
import SessaoCard from "./components/SessaoCard";
import CreateDuplaModal from "./components/CreateDuplaModal";
import AddSessaoModal from "./components/AddSessaoModal";
import { GiJoystick } from "react-icons/gi";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

export default function SimuladorPage() {
   const [search, setSearch] = useState("");
   const [anoRef, setAnoRef] = useState(currentYear);

   // Modais
   const [showCreateDupla, setShowCreateDupla] = useState(false);
   const [showAddSessao, setShowAddSessao] = useState(false);
   const [editingEtapa, setEditingEtapa] = useState<EtapaItem | null>(null);

   const {
      duplas,
      selectedDupla,
      selectedKey,
      setSelectedKey,
      isLoading,
      isError,
      handleDuplaCreated,
      removePending,
   } = useSimuladorDuplas(anoRef);

   const { push } = useToast();
   const deleteEtapaMutation = useDeleteEtapa();
   const deleteMissaoMutation = useDeleteEstatMissao();

   const handleAddSessao = useCallback(() => {
      if (!selectedDupla) return;
      setEditingEtapa(null);
      setShowAddSessao(true);
   }, [selectedDupla]);

   const handleSessaoClick = useCallback((etapa: EtapaItem) => {
      setEditingEtapa(etapa);
      setShowAddSessao(true);
   }, []);

   const handleDeleteSessao = useCallback(
      async (etapa: EtapaItem) => {
         try {
            const res = await deleteEtapaMutation.mutateAsync(etapa.id);
            push({
               title: res.ok ? "Sucesso!" : "Erro",
               message: res.message ?? "Sessão excluída",
               type: res.ok ? "success" : "error",
            });
            if (res.ok) {
               setShowAddSessao(false);
               setEditingEtapa(null);
            }
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao excluir sessão",
               type: "error",
            });
         }
      },
      [deleteEtapaMutation, push]
   );

   const handleDeleteDupla = useCallback(
      async (dupla: Dupla) => {
         if (dupla.etapas.length > 0) {
            push({
               title: "Erro",
               message: "Exclua todas as sessões antes de remover a dupla",
               type: "error",
            });
            return;
         }

         try {
            const res = await deleteMissaoMutation.mutateAsync(dupla.missaoId);
            push({
               title: res.ok ? "Sucesso!" : "Erro",
               message: res.message ?? "Dupla excluída",
               type: res.ok ? "success" : "error",
            });
            if (res.ok) {
               removePending(dupla.missaoId);
               if (selectedKey === dupla.key) setSelectedKey(null);
            }
         } catch (err) {
            push({
               title: "Erro",
               message:
                  err instanceof Error ? err.message : "Erro ao excluir dupla",
               type: "error",
            });
         }
      },
      [deleteMissaoMutation, push, selectedKey]
   );

   return (
      <div className="flex flex-col gap-3 p-1">
         {/* ── Header ─────────────────────────────────────────────────── */}
         <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 shadow-md">
                  <GiJoystick className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Simulador de Voo
                  </h1>
                  <p className="text-sm text-gray-500">
                     Sessões de simulador agrupadas por duplas de pilotos
                  </p>
               </div>
               <div className="ml-auto flex flex-wrap items-center gap-3">
                  <Label htmlFor="anoRef" className="font-medium text-gray-700">
                     Ano Referência:
                  </Label>
                  <Select
                     id="anoRef"
                     value={anoRef}
                     onChange={(e) => {
                        setAnoRef(Number(e.target.value));
                        setSelectedKey(null);
                     }}
                     className="w-24"
                  >
                     {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                           {year}
                        </option>
                     ))}
                  </Select>
               </div>
            </div>
         </div>

         {/* ── Conteúdo ───────────────────────────────────────────────── */}
         {isError && (
            <Alert color="failure">
               Erro ao carregar as sessões do simulador. Verifique a conexão e
               tente novamente.
            </Alert>
         )}

         {isLoading ? (
            <div className="flex justify-center py-16">
               <Spinner color="failure" size="lg" />
            </div>
         ) : (
            !isError && (
               <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex min-h-120">
                     <DuplasSidebar
                        duplas={duplas}
                        selectedKey={selectedKey}
                        search={search}
                        onSearchChange={setSearch}
                        onSelect={(key) =>
                           setSelectedKey((prev) => (prev === key ? null : key))
                        }
                        onCreateDupla={() => setShowCreateDupla(true)}
                     />

                     <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
                        {!selectedDupla ? (
                           <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                              <MdFlightTakeoff className="h-12 w-12 opacity-30" />
                              <p className="text-sm">
                                 Selecione uma dupla para ver as sessões
                              </p>
                           </div>
                        ) : (
                           <>
                              {/* Barra de ações da dupla */}
                              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
                                 <div>
                                    <p className="text-sm font-semibold text-gray-900 uppercase">
                                       <span className="mr-2 text-xs text-slate-400">
                                          #{selectedDupla?.missaoId}
                                       </span>
                                       {selectedDupla.pilots.length > 0
                                          ? selectedDupla.pilots
                                               .map(
                                                  (p) =>
                                                     `${p.p_g} ${p.nome_guerra}`
                                               )
                                               .join(" / ")
                                          : "Sem pilotos"}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Button
                                       color="red"
                                       size="sm"
                                       onClick={() =>
                                          handleDeleteDupla(selectedDupla)
                                       }
                                       disabled={
                                          selectedDupla.etapas.length > 0
                                       }
                                       title={
                                          selectedDupla.etapas.length > 0
                                             ? "Exclua todas as sessões primeiro"
                                             : "Excluir dupla"
                                       }
                                    >
                                       <MdDelete className="mr-2 h-4 w-4" />
                                       Excluir Dupla
                                    </Button>
                                    <Button
                                       color="light"
                                       size="sm"
                                       onClick={handleAddSessao}
                                    >
                                       <HiPlus className="mr-2 h-4 w-4" />
                                       Nova Sessão
                                    </Button>
                                 </div>
                              </div>

                              {/* Lista de sessões */}
                              <div className="flex-1 px-6 py-3">
                                 {selectedDupla.etapas.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                                       <MdFlightTakeoff className="h-10 w-10 opacity-20" />
                                       <p className="text-sm">
                                          Nenhuma sessão registrada.
                                       </p>
                                       <Button
                                          color="light"
                                          size="sm"
                                          onClick={handleAddSessao}
                                       >
                                          <HiPlus className="mr-2 h-4 w-4" />
                                          Adicionar primeira sessão
                                       </Button>
                                    </div>
                                 ) : (
                                    <div className="flex flex-col gap-2">
                                       {selectedDupla.etapas
                                          .slice()
                                          .sort((a, b) =>
                                             `${a.data}T${a.dep}`.localeCompare(
                                                `${b.data}T${b.dep}`
                                             )
                                          )
                                          .map((etapa: EtapaItem) => (
                                             <SessaoCard
                                                key={etapa.id}
                                                etapa={etapa}
                                                onClick={handleSessaoClick}
                                             />
                                          ))}
                                    </div>
                                 )}
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            )
         )}

         {/* ── Modais ─────────────────────────────────────────────────── */}
         <CreateDuplaModal
            show={showCreateDupla}
            onClose={() => setShowCreateDupla(false)}
            onCreated={handleDuplaCreated}
         />

         {selectedDupla && (
            <AddSessaoModal
               show={showAddSessao}
               onClose={() => {
                  setShowAddSessao(false);
                  setEditingEtapa(null);
               }}
               missaoId={selectedDupla.missaoId}
               pilots={selectedDupla.pilots}
               editEtapa={editingEtapa}
               onDelete={handleDeleteSessao}
            />
         )}
      </div>
   );
}
