"use client";

import {
   Button,
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
   onDelete: (id: number) => Promise<void>;
}

export function QuadsTrip({
   trip,
   totalQuads,
   groupName,
   typeName,
}: QuadsTripProps) {
   const [openModal, setOpenModal] = useState(false);
   const [showForm, setShowForm] = useState(false);
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

   const handleDelete = useCallback(
      async (quadId: number) => {
         try {
            const result = await deleteQuadMutation.mutateAsync(quadId);
            if (result.ok) {
               push({
                  message: result.message || "Quadrinho deletado com sucesso!",
                  type: "success",
               });
            } else {
               push({
                  message: result.message || "Erro ao deletar",
                  type: "error",
               });
            }
         } catch (err) {
            console.error(err);
            push({
               message: (err as Error).message || "Erro ao deletar quadrinho",
               type: "error",
            });
         }
      },
      [push, deleteQuadMutation]
   );

   const handleCloseModal = useCallback(() => {
      setOpenModal(false);
      setShowForm(false);
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

               <div className="h-96 overflow-y-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  {loading ? (
                     <LoadingState />
                  ) : quads.length > 0 ? (
                     <Table className="text-center" hoverable>
                        <TableHead>
                           <TableRow>
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
                                 onDelete={handleDelete}
                              />
                           ))}
                        </TableBody>
                     </Table>
                  ) : (
                     <EmptyState />
                  )}
               </div>

               <PermBased resource={"quad"} requiredPerm={"create"}>
                  <div className="mt-4 flex justify-center">
                     <Button
                        color="red"
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto"
                     >
                        <FaPlus className="mr-2 h-4 w-4" />
                        Adicionar Quadrinho
                     </Button>
                  </div>
               </PermBased>

               <QuadForm trip={trip} show={showForm} setShow={setShowForm} />
            </ModalBody>
         </Modal>
      </>
   );
}

function QuadRow({ quad, trip, onDelete }: QuadRowProps) {
   const [showForm, setShowForm] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const handleDeleteClick = useCallback(async () => {
      setShowDeleteConfirm(false);
      setDeleting(true);
      try {
         await onDelete(quad.id!);
      } finally {
         setDeleting(false);
      }
   }, [quad.id, onDelete]);

   const displayValue = quad.value ? isoDateToString(quad.value) : "LASTRO";
   const canEdit = Boolean(quad.value);

   return (
      <>
         <TableRow className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
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
                           disabled={deleting}
                        >
                           <FaEdit className="size-5" />
                        </button>
                     )}

                     {deleting ? (
                        <div className="p-2">
                           <Spinner size="sm" color="failure" />
                        </div>
                     ) : (
                        <button
                           onClick={() => setShowDeleteConfirm(true)}
                           className="cursor-pointer rounded-md p-2 text-red-500 transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95"
                           aria-label="Deletar quadrinho"
                        >
                           <FaRegTrashCan className="size-5" />
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

         <ConfirmDeleteModal
            show={showDeleteConfirm}
            onConfirm={handleDeleteClick}
            onCancel={() => setShowDeleteConfirm(false)}
         />
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
}: {
   show: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}) {
   return (
      <Modal show={show} size="sm" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <FaRegTrashCan className="mx-auto mb-4 h-14 w-14 text-red-500" />
               <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Tem certeza que deseja deletar este quadrinho?
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
