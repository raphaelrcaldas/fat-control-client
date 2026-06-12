"use client";

import { memo, useState } from "react";
import {
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   TableHeadCell,
   Tooltip,
   Modal,
   ModalHeader,
   ModalBody,
   Button,
} from "flowbite-react";
import { HiPencil, HiTrash, HiPlus, HiExclamationCircle } from "react-icons/hi";
import type { EtapaOut } from "services/routes/om/ordens";
import {
   extractTime,
   minutesToTime,
   calcularTempoVooMinutos,
   isoDateToString,
} from "utils/dateHandler";

interface EtapasTableProps {
   etapas: EtapaOut[];
   isEditable: boolean;
   canRemoveEtapa: boolean;
   onAddEtapa: () => void;
   onEditEtapa: (index: number) => void;
   onRemoveEtapa: (index: number) => void;
}

const formatDateTime = (dt: string | undefined) => {
   if (!dt) return { date: "—", time: "—" };
   return {
      date: isoDateToString(dt), // DD/MM/YY formato local
      time: extractTime(dt),
   };
};

const calcTempoVoo = (dtDep: string | undefined, dtArr: string | undefined) => {
   if (!dtDep || !dtArr) return "—";
   const minutes = calcularTempoVooMinutos(dtDep, dtArr);
   return minutesToTime(minutes);
};

export const EtapasTable = memo(function EtapasTable({
   etapas,
   isEditable,
   canRemoveEtapa,
   onAddEtapa,
   onEditEtapa,
   onRemoveEtapa,
}: EtapasTableProps) {
   const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
      null
   );

   const handleDeleteClick = (index: number) => {
      setDeleteConfirmIndex(index);
   };

   const handleConfirmDelete = () => {
      if (deleteConfirmIndex !== null) {
         onRemoveEtapa(deleteConfirmIndex);
         setDeleteConfirmIndex(null);
      }
   };

   const handleCancelDelete = () => {
      setDeleteConfirmIndex(null);
   };

   return (
      <>
         <div className="space-y-3">
            {/* Header com link adicionar */}
            <div className="flex items-center justify-between">
               <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                  <div className="h-4 w-1 rounded-full bg-amber-500"></div>
                  Etapas
                  <span className="text-red-500">*</span>
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                     {etapas.length}
                  </span>
               </h3>
               {isEditable && (
                  <button
                     type="button"
                     onClick={onAddEtapa}
                     className="group flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition-all hover:text-amber-700"
                  >
                     <HiPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
                     Adicionar
                  </button>
               )}
            </div>

            <div className="overflow-x-auto border border-gray-200 shadow-xs">
               <Table hoverable className="text-center">
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="w-10">#</TableHeadCell>
                        <TableHeadCell>Data Dep</TableHeadCell>
                        <TableHeadCell>Hora (Z)</TableHeadCell>
                        <TableHeadCell>Origem</TableHeadCell>
                        <TableHeadCell className="">T. Voo</TableHeadCell>
                        <TableHeadCell>Data Arr</TableHeadCell>
                        <TableHeadCell>Hora (Z)</TableHeadCell>
                        <TableHeadCell>Destino</TableHeadCell>
                        <TableHeadCell>Alt</TableHeadCell>
                        <TableHeadCell>T. Alt</TableHeadCell>
                        <TableHeadCell className="">Comb (T)</TableHeadCell>
                        <TableHeadCell>Esforço Aéreo</TableHeadCell>
                        <TableHeadCell className="w-20">
                           {isEditable && (
                              <span className="sr-only">Ações</span>
                           )}
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y">
                     {etapas.length === 0 ? (
                        <TableRow>
                           <TableCell
                              colSpan={13}
                              className="py-8 text-center text-gray-500"
                           >
                              <div className="flex flex-col items-center gap-2">
                                 <span className="text-sm">
                                    Nenhuma etapa cadastrada
                                 </span>
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        etapas.map((etapa, index) => {
                           const dep = formatDateTime(etapa.dt_dep);
                           const arr = formatDateTime(etapa.dt_arr);
                           const tempoVoo = calcTempoVoo(
                              etapa.dt_dep,
                              etapa.dt_arr
                           );
                           const tempoAlt = minutesToTime(etapa.tvoo_alt || 0);

                           return (
                              <TableRow
                                 key={index}
                                 className="bg-white font-mono hover:bg-gray-50"
                              >
                                 <TableCell className="text-center font-medium">
                                    {index + 1}
                                 </TableCell>
                                 <TableCell className="text-blue-600">
                                    {dep.date}
                                 </TableCell>
                                 <TableCell className="text-blue-600">
                                    {dep.time}
                                 </TableCell>
                                 <TableCell className="font-bold text-blue-600 uppercase">
                                    {etapa.origem || "—"}
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                                       {tempoVoo}
                                    </span>
                                 </TableCell>
                                 <TableCell className="text-green-600">
                                    {arr.date}
                                 </TableCell>
                                 <TableCell className="text-green-600">
                                    {arr.time}
                                 </TableCell>
                                 <TableCell className="font-bold text-green-600 uppercase">
                                    {etapa.dest || "—"}
                                 </TableCell>
                                 <TableCell className="uppercase">
                                    {etapa.alternativa || "—"}
                                 </TableCell>
                                 <TableCell className="">{tempoAlt}</TableCell>
                                 <TableCell className="text-center font-mono">
                                    {etapa.qtd_comb || "—"}
                                 </TableCell>
                                 <TableCell className="font-medium uppercase">
                                    {etapa.esf_aer || "—"}
                                 </TableCell>
                                 {isEditable && (
                                    <TableCell>
                                       <div className="flex items-center justify-center gap-1">
                                          <Tooltip content="Editar">
                                             <button
                                                type="button"
                                                onClick={() =>
                                                   onEditEtapa(index)
                                                }
                                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-600"
                                                aria-label={`Editar etapa ${index + 1}`}
                                             >
                                                <HiPencil className="h-4 w-4" />
                                             </button>
                                          </Tooltip>
                                          {canRemoveEtapa && (
                                             <Tooltip content="Excluir">
                                                <button
                                                   type="button"
                                                   onClick={() =>
                                                      handleDeleteClick(index)
                                                   }
                                                   className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600"
                                                   aria-label={`Excluir etapa ${index + 1}`}
                                                >
                                                   <HiTrash className="h-4 w-4" />
                                                </button>
                                             </Tooltip>
                                          )}
                                       </div>
                                    </TableCell>
                                 )}
                              </TableRow>
                           );
                        })
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

         {/* Modal de confirmação de exclusão */}
         <Modal
            show={deleteConfirmIndex !== null}
            size="md"
            onClose={handleCancelDelete}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className="text-center">
                  <HiExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                     Excluir Etapa #
                     {deleteConfirmIndex !== null ? deleteConfirmIndex + 1 : ""}
                  </h3>

                  {/* Detalhes da etapa */}
                  {deleteConfirmIndex !== null &&
                     etapas[deleteConfirmIndex] && (
                        <div className="mb-5 rounded-lg bg-gray-50 p-3 text-left font-mono">
                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                 <span className="text-xs text-gray-500">
                                    Decolagem
                                 </span>
                                 <div className="text-blue-600">
                                    {
                                       formatDateTime(
                                          etapas[deleteConfirmIndex].dt_dep
                                       ).date
                                    }{" "}
                                    {
                                       formatDateTime(
                                          etapas[deleteConfirmIndex].dt_dep
                                       ).time
                                    }
                                    Z
                                 </div>
                                 <div className="font-bold text-blue-600">
                                    {etapas[deleteConfirmIndex].origem || "—"}
                                 </div>
                              </div>
                              <div>
                                 <span className="text-xs text-gray-500">
                                    Pouso
                                 </span>
                                 <div className="text-green-600">
                                    {
                                       formatDateTime(
                                          etapas[deleteConfirmIndex].dt_arr
                                       ).date
                                    }{" "}
                                    {
                                       formatDateTime(
                                          etapas[deleteConfirmIndex].dt_arr
                                       ).time
                                    }
                                    Z
                                 </div>
                                 <div className="font-bold text-green-600">
                                    {etapas[deleteConfirmIndex].dest || "—"}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                  <p className="mb-5 text-sm text-gray-500">
                     Tem certeza que deseja excluir esta etapa?
                  </p>
                  <div className="flex justify-center gap-4">
                     <Button color="red" onClick={handleConfirmDelete}>
                        Sim, excluir
                     </Button>
                     <Button color="gray" onClick={handleCancelDelete}>
                        Cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>
      </>
   );
});
