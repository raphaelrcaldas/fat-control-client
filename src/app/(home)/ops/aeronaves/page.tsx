"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import { HiPlus, HiExclamationCircle } from "react-icons/hi";
import { MdFlightTakeoff } from "react-icons/md";
import clsx from "clsx";
import { useAllAeronaves } from "@/hooks/queries/useAeronaves";
import { AeronaveTable } from "./components/AeronaveTable";
import { AeronaveCard } from "./components/AeronaveCard";
import { AeronaveFormModal } from "./components/AeronaveFormModal";
import { SituacaoSummary } from "./components/SituacaoSummary";
import { AeronaveListSkeleton } from "./components/AeronaveListSkeleton";
import type { AeronavePublic } from "services/routes/aeronaves";
import type { SituacaoValue } from "./schemas/aeronaveSchema";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

export default function AeronavesPage() {
   const [showFormModal, setShowFormModal] = useState(false);
   const [editingAeronave, setEditingAeronave] =
      useState<AeronavePublic | null>(null);
   const [selectedSituacao, setSelectedSituacao] =
      useState<SituacaoValue | null>(null);
   const { data, isLoading, isFetching, isError, refetch } = useAllAeronaves();

   const aeronaves = data ?? [];
   // Filtro client-side sobre a frota inteira (já carregada por inteiro
   // via useAllAeronaves). Os cards do resumo não usam esta lista — eles
   // sempre agregam sobre `aeronaves`, nunca sobre o resultado filtrado.
   //
   // O `a.active` não é enfeite: os cards contam situação **entre as ativas**
   // (ver SituacaoSummary), então sem ele o filtro traria também as inativas
   // daquela situação e a lista mostraria mais linhas do que o número no card
   // que foi clicado.
   const filteredAeronaves = selectedSituacao
      ? aeronaves.filter((a) => a.active && a.sit === selectedSituacao)
      : aeronaves;
   const showSkeleton = isLoading || (isFetching && !data);
   // Só troca a lista pelo estado de erro quando não há nada em tela. Um
   // refetch que falha (invalidação pós-mutation) mantém os dados anteriores
   // em vez de apagar uma lista boa.
   const showError = isError && !data;

   const handleEdit = (aeronave: AeronavePublic) => {
      setEditingAeronave(aeronave);
      setShowFormModal(true);
   };

   const handleOpenCreate = () => {
      setEditingAeronave(null);
      setShowFormModal(true);
   };

   const handleCloseFormModal = () => {
      setShowFormModal(false);
      setEditingAeronave(null);
   };

   return (
      <div className="space-y-2">
         {/* Masthead — referência canônica (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdFlightTakeoff className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Aeronaves
                     </h1>
                  </div>
               </div>

               <PermBased resource={"ops.aeronaves"} requiredPerm={"create"}>
                  <Button
                     color="primary"
                     onClick={handleOpenCreate}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Aeronave
                  </Button>
               </PermBased>
            </div>
         </header>

         {/* Content */}
         {showSkeleton ? (
            <AeronaveListSkeleton />
         ) : showError ? (
            <div className="flex h-64 flex-col items-center justify-center rounded border border-slate-200 bg-white shadow-sm">
               <div className="mb-4 rounded-full bg-red-50 p-4">
                  <HiExclamationCircle className="h-12 w-12 text-red-500" />
               </div>
               <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Não foi possível carregar as aeronaves
               </h2>
               <p className="mb-4 text-sm text-gray-500">
                  Verifique sua conexão e tente novamente
               </p>
               <Button color="light" size="sm" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         ) : aeronaves.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded border border-slate-200 bg-white shadow-sm">
               <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <MdFlightTakeoff className="h-12 w-12 text-gray-400" />
               </div>
               <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Nenhuma aeronave cadastrada
               </h2>
               <p className="mb-4 text-sm text-gray-500">
                  Cadastre a primeira aeronave para começar
               </p>

               <PermBased resource={"ops.aeronaves"} requiredPerm={"create"}>
                  <Button color="primary" onClick={handleOpenCreate} size="sm">
                     <HiPlus className="mr-2 h-4 w-4" />
                     Cadastrar Aeronave
                  </Button>
               </PermBased>
            </div>
         ) : (
            <div
               className={clsx(
                  "space-y-2 transition-opacity duration-200",
                  isFetching ? "opacity-50" : "opacity-100"
               )}
            >
               {/* Summary Cards — sempre a frota inteira, funcionam como filtro */}
               <SituacaoSummary
                  aeronaves={aeronaves}
                  selectedSituacao={selectedSituacao}
                  onSelectSituacao={setSelectedSituacao}
               />

               {filteredAeronaves.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center rounded border border-slate-200 bg-white shadow-sm">
                     <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <MdFlightTakeoff className="h-12 w-12 text-gray-400" />
                     </div>
                     <h2 className="mb-2 text-lg font-semibold text-gray-900">
                        Nenhuma aeronave nesta situação
                     </h2>
                     <p className="mb-4 text-sm text-gray-500">
                        Ajuste o filtro para ver outras aeronaves da frota
                     </p>
                     <Button
                        color="light"
                        size="sm"
                        onClick={() => setSelectedSituacao(null)}
                     >
                        Limpar filtro
                     </Button>
                  </div>
               ) : (
                  <>
                     {/* Desktop Table */}
                     <AeronaveTable
                        aeronaves={filteredAeronaves}
                        onEdit={handleEdit}
                     />

                     {/* Mobile Cards */}
                     <div className="space-y-3 md:hidden">
                        {filteredAeronaves.map((aeronave) => (
                           <AeronaveCard
                              key={aeronave.matricula}
                              aeronave={aeronave}
                              onEdit={handleEdit}
                           />
                        ))}
                     </div>
                  </>
               )}
            </div>
         )}

         {/* Modals */}
         <AeronaveFormModal
            show={showFormModal}
            onClose={handleCloseFormModal}
            editingAeronave={editingAeronave}
         />
      </div>
   );
}
