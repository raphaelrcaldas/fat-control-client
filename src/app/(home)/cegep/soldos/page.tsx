"use client";

import { useState, useMemo } from "react";
import { Button, Spinner, Alert } from "flowbite-react";
import {
   HiPlus,
   HiCurrencyDollar,
   HiExclamation,
} from "react-icons/hi";
import { useToast } from "../../../context/toast";
import {
   useSoldos,
   useCreateSoldo,
   useUpdateSoldo,
   useDeleteSoldo,
} from "@/hooks/queries";
import { SoldoPublic } from "services/routes/cegep/soldos";
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

export default function SoldosPage() {
   const [circuloFilter, setCirculoFilter] = useState("");
   const [onlyActive, setOnlyActive] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [editingSoldo, setEditingSoldo] = useState<SoldoPublic | null>(null);
   const { push } = useToast();

   // React Query hooks
   const {
      data: soldos = [],
      isLoading,
      error,
      isFetching,
   } = useSoldos({
      circulo: circuloFilter || undefined,
      activeOnly: onlyActive,
   });

   const createMutation = useCreateSoldo();
   const updateMutation = useUpdateSoldo();
   const deleteMutation = useDeleteSoldo();

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
      const dataToSend = {
         pg: formData.pg,
         data_inicio: formData.data_inicio,
         data_fim: formData.data_fim || null,
         valor: formData.valor,
      };

      try {
         if (editingSoldo) {
            await updateMutation.mutateAsync({
               id: editingSoldo.id,
               data: dataToSend,
            });
            push({
               title: "Sucesso!",
               message: "Soldo atualizado com sucesso",
               type: "success",
            });
         } else {
            await createMutation.mutateAsync(dataToSend);
            push({
               title: "Sucesso!",
               message: "Soldo cadastrado com sucesso",
               type: "success",
            });
         }
         handleCloseModal();
      } catch (err: unknown) {
         const errorMessage =
            err instanceof Error ? err.message : "Erro ao salvar soldo";
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
            await deleteMutation.mutateAsync(soldo.id);
            push({
               title: "Sucesso!",
               message: "Soldo excluido com sucesso",
               type: "success",
            });
         } catch (err: unknown) {
            const errorMessage =
               err instanceof Error ? err.message : "Erro ao excluir soldo";
            push({
               title: "Erro",
               message: errorMessage,
               type: "error",
            });
         }
      }
   };

   const errorMessage = error instanceof Error ? error.message : null;
   const loading = isLoading;

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
            {errorMessage && (
               <Alert color="failure" icon={HiExclamation} className="mt-4">
                  <span className="font-medium">Erro!</span> {errorMessage}
               </Alert>
            )}
         </div>

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
         <div
            className={`min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${
               isFetching && !loading ? "opacity-50" : ""
            }`}
         >
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
