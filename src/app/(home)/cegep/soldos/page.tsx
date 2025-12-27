"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import {
   HiPlus,
   HiCurrencyDollar,
   HiExclamation,
   HiTrendingUp,
   HiTrendingDown,
} from "react-icons/hi";
import { useToast } from "../../../context/toast";
import {
   getSoldos,
   getSoldoStats,
   createSoldo,
   updateSoldo,
   deleteSoldo,
   SoldoPublic,
   SoldoStats,
} from "services/routes/cegep/soldos";
import SoldoFormModal from "./components/SoldoFormModal";
import SoldoTable from "./components/SoldoTable";
import { SoldoFormData } from "./schemas/soldoSchema";
import { postoGradRecords, CIRCULO_LABELS } from "services/routes/postos";

const CIRCULO_OPTIONS = [
   { value: "", label: "Todos" },
   ...Array.from(new Set(postoGradRecords.map((p) => p.circulo))).map(
      (circulo) => ({
         value: circulo,
         label: CIRCULO_LABELS[circulo] || circulo,
      })
   ),
];

const formatCurrency = (value: number | null) => {
   if (value === null) return "-";
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(value);
};

export default function SoldosPage() {
   const [soldos, setSoldos] = useState<SoldoPublic[]>([]);
   const [stats, setStats] = useState<SoldoStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [circuloFilter, setCirculoFilter] = useState("");
   const [onlyActive, setOnlyActive] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [editingSoldo, setEditingSoldo] = useState<SoldoPublic | null>(null);
   const { push } = useToast();

   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);

         const [soldosData, statsData] = await Promise.all([
            getSoldos(circuloFilter || undefined, onlyActive),
            getSoldoStats(circuloFilter || undefined),
         ]);

         setSoldos(soldosData);
         setStats(statsData);
      } catch (err: any) {
         const errorMessage = err?.message || "Erro ao carregar soldos";
         setError(errorMessage);
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   }, [circuloFilter, onlyActive, push]);

   useEffect(() => {
      loadData();
   }, [loadData]);

   const sortedSoldos = useMemo(() => {
      return [...soldos].sort((a, b) => {
         const antA = a.posto_grad?.ant || 0;
         const antB = b.posto_grad?.ant || 0;
         return antA - antB;
      });
   }, [soldos]);

   const handleOpenModal = (soldo: SoldoPublic | null = null) => {
      setEditingSoldo(soldo);
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingSoldo(null);
   };

   const handleSubmit = async (formData: SoldoFormData) => {
      try {
         setError(null);

         const dataToSend = {
            pg: formData.pg,
            data_inicio: formData.data_inicio,
            data_fim: formData.data_fim || null,
            valor: formData.valor,
         };

         if (editingSoldo) {
            const updated = await updateSoldo(editingSoldo.id, dataToSend);
            setSoldos(
               soldos.map((s) => (s.id === editingSoldo.id ? updated : s))
            );
            push({
               title: "Sucesso!",
               message: "Soldo atualizado com sucesso",
               type: "success",
            });
         } else {
            const created = await createSoldo(dataToSend);
            setSoldos([...soldos, created]);
            push({
               title: "Sucesso!",
               message: "Soldo cadastrado com sucesso",
               type: "success",
            });
         }

         handleCloseModal();
         loadData();
      } catch (err: any) {
         const errorMessage = err?.message || "Erro ao salvar soldo";
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
      }
   };

   const handleDelete = async (soldo: SoldoPublic) => {
      if (
         confirm(
            `Tem certeza que deseja excluir o soldo de ${soldo.posto_grad?.mid || soldo.pg}?`
         )
      ) {
         try {
            setError(null);
            await deleteSoldo(soldo.id);
            setSoldos(soldos.filter((s) => s.id !== soldo.id));
            push({
               title: "Sucesso!",
               message: "Soldo excluido com sucesso",
               type: "success",
            });
            loadData();
         } catch (err: any) {
            const errorMessage = err?.message || "Erro ao excluir soldo";
            push({
               title: "Erro",
               message: errorMessage,
               type: "error",
            });
         }
      }
   };

   return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
         {/* Header */}
         <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                     <HiCurrencyDollar className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                     <h5 className="text-lg font-semibold text-gray-900">
                        Gestao de Soldos
                     </h5>
                     <p className="text-sm text-gray-500">
                        {loading
                           ? "Carregando..."
                           : `${sortedSoldos.length} registro(s) encontrado(s)`}
                     </p>
                  </div>
               </div>
               <Button
                  color="red"
                  onClick={() => handleOpenModal()}
                  disabled={loading}
               >
                  <HiPlus className="mr-2 h-5 w-5" />
                  Novo Soldo
               </Button>
            </div>

            {/* Erro */}
            {error && (
               <Alert color="failure" icon={HiExclamation} className="mt-4">
                  <span className="font-medium">Erro!</span> {error}
               </Alert>
            )}
         </div>

         {/* Stats Cards */}
         {stats && (
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
               <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="rounded-lg bg-blue-100 p-2">
                        <HiCurrencyDollar className="h-5 w-5 text-blue-600" />
                     </div>
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                           Total de Registros
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                           {stats.total}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="rounded-lg bg-red-100 p-2">
                        <HiTrendingDown className="h-5 w-5 text-red-600" />
                     </div>
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                           Menor Soldo
                        </p>
                        <p className="font-mono text-xl font-bold text-gray-900">
                           {formatCurrency(stats.min_valor)}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                     <div className="rounded-lg bg-green-100 p-2">
                        <HiTrendingUp className="h-5 w-5 text-green-600" />
                     </div>
                     <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                           Maior Soldo
                        </p>
                        <p className="font-mono text-xl font-bold text-gray-900">
                           {formatCurrency(stats.max_valor)}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Filtros */}
         <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
               {CIRCULO_OPTIONS.map((option) => (
                  <button
                     key={option.value}
                     onClick={() => setCirculoFilter(option.value)}
                     disabled={loading}
                     className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        circuloFilter === option.value
                           ? "border-red-300 bg-red-50 text-red-700"
                           : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                     }`}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
               <input
                  type="checkbox"
                  id="onlyActive"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={loading}
               />
               <label
                  htmlFor="onlyActive"
                  className="cursor-pointer text-sm font-medium text-gray-700"
               >
                  Somente vigentes
               </label>
            </div>
         </div>

         {/* Content */}
         <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {loading ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <Spinner size="xl" color="failure" />
                  <p className="mt-4 text-gray-600">Carregando soldos...</p>
               </div>
            ) : sortedSoldos.length === 0 ? (
               <div className="flex h-64 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                     <HiCurrencyDollar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                     Nenhum soldo encontrado
                  </h3>
                  <p className="mb-4 max-w-md text-center text-gray-500">
                     {circuloFilter || onlyActive
                        ? "Nao ha registros para os filtros selecionados."
                        : "Comece adicionando o primeiro registro de soldo."}
                  </p>
                  {!circuloFilter && !onlyActive && (
                     <Button color="red" onClick={() => handleOpenModal()}>
                        <HiPlus className="mr-2 h-5 w-5" />
                        Adicionar Primeiro Soldo
                     </Button>
                  )}
               </div>
            ) : (
               <div className="h-full overflow-y-auto">
                  <SoldoTable
                     soldos={sortedSoldos}
                     onEdit={handleOpenModal}
                     onDelete={handleDelete}
                  />
               </div>
            )}
         </div>

         {/* Modal */}
         <SoldoFormModal
            show={showModal}
            editingSoldo={editingSoldo}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
         />
      </div>
   );
}
