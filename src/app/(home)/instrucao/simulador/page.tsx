"use client";

import { useState, useCallback } from "react";
import { Alert } from "flowbite-react";
import clsx from "clsx";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { useSimuladorDuplas } from "./hooks/useSimuladorDuplas";
import { useSimuladorActions } from "./hooks/useSimuladorActions";
import SimuladorHeader from "./components/SimuladorHeader";
import DuplasSidebar from "./components/DuplasSidebar";
import SessoesPanel from "./components/SessoesPanel";
import SimuladorBoardSkeleton from "./components/SimuladorBoardSkeleton";
import CreateDuplaModal from "./components/CreateDuplaModal";
import AddSessaoModal from "./components/AddSessaoModal";

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
      isFetching,
      isError,
      handleDuplaCreated,
      removePending,
   } = useSimuladorDuplas(anoRef);

   const { deleteSessao, deleteDupla } = useSimuladorActions({
      selectedKey,
      setSelectedKey,
      removePending,
   });

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
         const ok = await deleteSessao(etapa);
         if (ok) {
            setShowAddSessao(false);
            setEditingEtapa(null);
         }
      },
      [deleteSessao]
   );

   const handleAnoChange = useCallback(
      (ano: number) => {
         setAnoRef(ano);
         setSelectedKey(null);
      },
      [setSelectedKey]
   );

   return (
      <div className="space-y-2">
         <SimuladorHeader
            anoRef={anoRef}
            yearOptions={YEAR_OPTIONS}
            onAnoChange={handleAnoChange}
         />

         {isError && (
            <Alert color="failure">
               Erro ao carregar as sessões do simulador. Verifique a conexão e
               tente novamente.
            </Alert>
         )}

         {isLoading ? (
            <SimuladorBoardSkeleton />
         ) : (
            !isError && (
               <div
                  className={clsx(
                     "overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-opacity",
                     isFetching && "opacity-50"
                  )}
               >
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

                     <SessoesPanel
                        dupla={selectedDupla}
                        onAddSessao={handleAddSessao}
                        onDeleteDupla={deleteDupla}
                        onSessaoClick={handleSessaoClick}
                     />
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
