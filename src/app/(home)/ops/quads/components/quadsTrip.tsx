"use client";

import {
   Button,
   Checkbox,
   Modal,
   ModalBody,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Spinner,
} from "flowbite-react";
import { useState, useCallback, useMemo } from "react";
import { isoDateToString } from "utils/dateHandler";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { CrewMember } from "services/routes/trips";
import { Quad } from "services/routes/quads";
import QuadForm from "./quadForm";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useToast } from "@/app/context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { useQuadsByTrip, useDeleteQuad } from "@/hooks/queries";

interface QuadsTripProps {
   trip: CrewMember;
   totalQuads: number;
   groupName: string;
   typeName: string;
}

interface QuadRowProps {
   quad: Quad;
   trip: CrewMember;
   selected: boolean;
   onToggleSelect: (id: number) => void;
}

export function QuadsTrip({
   trip,
   totalQuads,
   groupName,
   typeName,
}: QuadsTripProps) {
   const [openModal, setOpenModal] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
   const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
   const [batchDeleting, setBatchDeleting] = useState(false);
   const { quadType } = useQuadsContext();
   const { push } = useToast();

   // React Query hooks
   const { data: quads = [], isLoading: loading } = useQuadsByTrip(
      trip.id,
      quadType,
      openModal
   );

   const deleteQuadMutation = useDeleteQuad();

   const userName = useMemo(
      () => `${trip.user.posto.short} ${trip.user.nome_guerra}`,
      [trip.user.posto.short, trip.user.nome_guerra]
   );

   const handleToggleSelect = useCallback((id: number) => {
      setSelectedIds((prev) => {
         const next = new Set(prev);
         if (next.has(id)) {
            next.delete(id);
         } else {
            next.add(id);
         }
         return next;
      });
   }, []);

   const handleSelectAll = useCallback(() => {
      const allIds = quads
         .map((q) => q.id)
         .filter((id): id is number => id !== undefined);
      setSelectedIds(new Set(allIds));
   }, [quads]);

   const handleClearSelection = useCallback(() => {
      setSelectedIds(new Set());
   }, []);

   const handleBatchDelete = useCallback(async () => {
      setShowBatchDeleteConfirm(false);
      setBatchDeleting(true);
      try {
         const ids = Array.from(selectedIds);
         const result = await deleteQuadMutation.mutateAsync(ids);
         if (result.ok) {
            push({
               message:
                  result.message ||
                  `${ids.length} quadrinho(s) deletado(s) com sucesso!`,
               type: "success",
            });
            setSelectedIds(new Set());
         } else {
            push({
               message: result.message || "Erro ao deletar quadrinhos",
               type: "error",
            });
         }
      } catch (err) {
         console.error(err);
         push({
            message: (err as Error).message || "Erro ao deletar quadrinhos",
            type: "error",
         });
      } finally {
         setBatchDeleting(false);
      }
   }, [selectedIds, deleteQuadMutation, push]);

   const handleCloseModal = useCallback(() => {
      setOpenModal(false);
      setShowForm(false);
      setSelectedIds(new Set());
   }, []);

   return (
      <>
         <Button
            color="light"
            onClick={() => setOpenModal(true)}
            className="inline-flex w-16 items-center overflow-visible px-0 text-sm font-medium uppercase transition-colors hover:bg-gray-100"
            size="sm"
            aria-label={`Ver quadrinhos de ${userName}`}
         >
            {trip.trig}
            <div
               className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white"
               aria-label={`${totalQuads} quadrinhos`}
            >
               {totalQuads}
            </div>
         </Button>

         <Modal
            show={openModal}
            size="md"
            onClose={handleCloseModal}
            popup
            dismissible
         >
            <ModalHeader>
               <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                     <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                     </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                     Quadrinhos
                  </span>
               </div>
            </ModalHeader>
            <ModalBody>
               <div className="mb-2 rounded-xl border border-red-200 bg-red-100 p-4">
                  <div className="text-center uppercase">
                     <h2 className="text-lg font-bold text-gray-900">
                        {userName}
                     </h2>
                  </div>
               </div>

               <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <div className="text-center">
                     <p className="mb-1 flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 uppercase">
                        {groupName.toLowerCase().includes("internacional") && (
                           <span className="text-blue-600">🌍</span>
                        )}
                        {groupName}
                     </p>
                     <p className="text-sm font-bold text-gray-900 uppercase">
                        {typeName}
                     </p>
                  </div>
               </div>

               {quads.length > 0 && selectedIds.size > 0 && (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                     <span className="text-sm font-semibold text-gray-700">
                        {selectedIds.size} selecionado(s)
                     </span>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleSelectAll}
                           className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                        >
                           Selecionar Todos
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                           onClick={handleClearSelection}
                           className="cursor-pointer text-xs font-medium text-gray-500 hover:underline"
                        >
                           Limpar
                        </button>
                     </div>
                  </div>
               )}

               <div className="h-96 overflow-y-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  {loading ? (
                     <LoadingState />
                  ) : quads.length > 0 ? (
                     <Table className="text-center" hoverable>
                        <TableHead>
                           <TableRow>
                              <TableHeadCell className="w-10" />
                              <TableHeadCell>Valor</TableHeadCell>
                              <TableHeadCell>Ações</TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {quads.map((quad, index) => (
                              <QuadRow
                                 key={index}
                                 quad={quad}
                                 trip={trip}
                                 selected={
                                    quad.id !== undefined &&
                                    selectedIds.has(quad.id)
                                 }
                                 onToggleSelect={handleToggleSelect}
                              />
                           ))}
                        </TableBody>
                     </Table>
                  ) : (
                     <EmptyState />
                  )}
               </div>

               <div className="mt-4 flex items-center justify-center gap-2">
                  <PermBased resource={"quad_ops"} requiredPerm={"create"}>
                     {selectedIds.size > 0 && (
                        <Button
                           color="gray"
                           disabled={batchDeleting}
                           onClick={() => setShowBatchDeleteConfirm(true)}
                           className="w-full sm:w-auto"
                        >
                           {batchDeleting ? (
                              <Spinner
                                 size="sm"
                                 color="failure"
                                 className="mr-2"
                              />
                           ) : (
                              <FaRegTrashCan className="mr-2 h-4 w-4" />
                           )}
                           Deletar ({selectedIds.size})
                        </Button>
                     )}
                  </PermBased>
                  <PermBased resource={"quad"} requiredPerm={"create"}>
                     <Button
                        color="red"
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto"
                     >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Adicionar Quadrinho
                     </Button>
                  </PermBased>
               </div>

               <QuadForm trip={trip} show={showForm} setShow={setShowForm} />
            </ModalBody>
         </Modal>

         <ConfirmDeleteModal
            show={showBatchDeleteConfirm}
            onConfirm={handleBatchDelete}
            onCancel={() => setShowBatchDeleteConfirm(false)}
            count={selectedIds.size}
         />
      </>
   );
}

function QuadRow({ quad, trip, selected, onToggleSelect }: QuadRowProps) {
   const [showForm, setShowForm] = useState(false);

   const displayValue = quad.value ? isoDateToString(quad.value) : "LASTRO";
   const canEdit = Boolean(quad.value);

   return (
      <>
         <TableRow className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
            <TableCell className="w-10">
               <Checkbox
                  checked={selected}
                  onChange={() =>
                     quad.id !== undefined && onToggleSelect(quad.id)
                  }
                  className="size-5 text-red-600 focus:ring-red-500"
               />
            </TableCell>
            <TableCell className="text-center font-semibold">
               {displayValue}
            </TableCell>
            <TableCell>
               <div className="flex items-center justify-center gap-2">
                  <PermBased resource={"quad_ops"} requiredPerm={"create"}>
                     {canEdit && (
                        <button
                           onClick={() => setShowForm(true)}
                           className="cursor-pointer rounded-md p-2 text-blue-500 transition-all duration-200 hover:bg-blue-500 hover:text-white active:scale-95"
                           aria-label="Editar quadrinho"
                        >
                           <FaEdit className="size-5" />
                        </button>
                     )}
                  </PermBased>
               </div>
            </TableCell>
         </TableRow>

         {canEdit && (
            <QuadForm
               show={showForm}
               setShow={setShowForm}
               trip={trip}
               quad={quad}
            />
         )}
      </>
   );
}

function LoadingState() {
   return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
         <Spinner size="lg" color="failure" />
         <p className="text-sm text-gray-600 dark:text-gray-400">
            Carregando quadrinhos...
         </p>
      </div>
   );
}

function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
         <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg
               className="h-10 w-10 text-gray-400"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
               />
            </svg>
         </div>
         <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Nenhum quadrinho encontrado
         </h3>
         <p className="text-center text-sm text-gray-500">
            Não há quadrinhos cadastrados para este tripulante.
         </p>
      </div>
   );
}

function ConfirmDeleteModal({
   show,
   onConfirm,
   onCancel,
   count,
}: {
   show: boolean;
   onConfirm: () => void;
   onCancel: () => void;
   count?: number;
}) {
   const isBatch = count !== undefined && count > 1;
   const message = isBatch
      ? `Tem certeza que deseja deletar ${count} quadrinhos selecionados?`
      : "Tem certeza que deseja deletar este quadrinho?";

   return (
      <Modal show={show} size="sm" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <FaRegTrashCan className="mx-auto mb-4 h-14 w-14 text-red-500" />
               <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  {message}
               </h3>
               <div className="flex justify-center gap-4">
                  <Button color="red" onClick={onConfirm}>
                     Sim, deletar
                  </Button>
                  <Button color="gray" onClick={onCancel}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
