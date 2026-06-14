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
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuadsContext } from "@/app/(home)/context/quads";
import { CrewMember } from "services/routes/trips";
import { Quad } from "services/routes/quads";
import { QuadForm } from "./QuadForm";
import { quadDisplayValue } from "../utils/quadDisplay";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaPlus } from "react-icons/fa";
import { HiOutlineClipboardList } from "react-icons/hi";
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

const QUAD_CHECKBOX_CLASS =
   "size-5 cursor-pointer rounded border-2 border-gray-500 text-red-600 ring-offset-1 checked:border-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2";

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

   const selectAllRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (selectAllRef.current) {
         selectAllRef.current.indeterminate =
            selectedIds.size > 0 && selectedIds.size < quads.length;
      }
   }, [selectedIds.size, quads.length]);

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
               className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full border-2 border-white bg-red-500 font-mono text-xs text-white"
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-600 shadow">
                     <HiOutlineClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                     Quadrinhos
                  </span>
               </div>
            </ModalHeader>
            <ModalBody>
               <div className="mb-2 rounded border border-red-200 bg-red-100 p-4">
                  <div className="text-center uppercase">
                     <h2 className="text-lg font-bold text-gray-900">
                        {userName}
                     </h2>
                  </div>
               </div>

               <div className="mb-4 rounded border border-slate-200 bg-gray-50 p-2">
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

               <div
                  className={`mb-3 flex items-center justify-between rounded border border-red-300 bg-red-50 px-3 py-2 shadow-sm transition-opacity duration-150 ${
                     quads.length > 0 && selectedIds.size > 0
                        ? "opacity-100"
                        : "invisible opacity-0"
                  }`}
               >
                  <span className="text-sm font-semibold text-red-700">
                     ✓ {selectedIds.size} selecionado(s)
                  </span>
                  <button
                     onClick={handleClearSelection}
                     className="cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  >
                     Limpar seleção
                  </button>
               </div>

               <div className="h-96 overflow-y-auto rounded bg-white shadow-sm ring-1 ring-slate-200">
                  {loading ? (
                     <LoadingState />
                  ) : quads.length > 0 ? (
                     <Table
                        className="text-center"
                        hoverable
                        theme={{
                           head: {
                              cell: {
                                 base: "bg-white border-b border-slate-200",
                              },
                           },
                        }}
                     >
                        <TableHead>
                           <TableRow>
                              <TableHeadCell className="w-10">
                                 <Checkbox
                                    ref={selectAllRef}
                                    color="red"
                                    checked={
                                       quads.length > 0 &&
                                       selectedIds.size === quads.length
                                    }
                                    onChange={
                                       selectedIds.size === quads.length
                                          ? handleClearSelection
                                          : handleSelectAll
                                    }
                                    title={
                                       selectedIds.size === quads.length
                                          ? "Desmarcar todos"
                                          : "Selecionar todos"
                                    }
                                    className={QUAD_CHECKBOX_CLASS}
                                 />
                              </TableHeadCell>
                              <TableHeadCell>Valor</TableHeadCell>
                              <TableHeadCell>Ações</TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {quads.map((quad) => (
                              <QuadRow
                                 key={quad.id ?? quad.value}
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

   const displayValue = quadDisplayValue(quad);
   const canEdit = Boolean(quad.value);

   return (
      <>
         <TableRow className="min-h-11 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
            <TableCell className="w-10">
               <Checkbox
                  checked={selected}
                  onChange={() =>
                     quad.id !== undefined && onToggleSelect(quad.id)
                  }
                  className={QUAD_CHECKBOX_CLASS}
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
                           className="cursor-pointer rounded p-2 text-blue-500 transition-all duration-200 hover:bg-blue-500 hover:text-white active:scale-95"
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
      <div className="divide-y divide-slate-200">
         {/* Cabeçalho (espelha checkbox / Valor / Ações) */}
         <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-10">
               <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex flex-1 justify-center">
               <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="flex flex-1 justify-center">
               <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
            </div>
         </div>

         {/* Linhas */}
         {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex min-h-11 items-center gap-2 px-4 py-2">
               <div className="w-10">
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
               </div>
               <div className="flex flex-1 justify-center">
                  <div className="h-4 w-10 animate-pulse rounded bg-slate-200" />
               </div>
               <div className="flex flex-1 justify-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-slate-100" />
               </div>
            </div>
         ))}
      </div>
   );
}

function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
         <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <HiOutlineClipboardList className="h-10 w-10 text-gray-400" />
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
