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
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getQuadById, deleteQuad } from "services/routes/quads";
import { isoDateToString } from "utils/dateHandler";
import { useQuadsContext } from "../../context/quads";
import { CrewMember } from "services/routes/trips";
import { Quad } from "services/routes/quads";
import QuadForm from "./quadForm";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit, FaPlus } from "react-icons/fa";
import { useToast } from "@/app/context/toast";
import { PermBased } from "../../hooks/usePermBased";

interface QuadsTripProps {
   trip: CrewMember;
   totalQuads: number;
   update: () => void;
}

interface QuadRowProps {
   quad: Quad;
   trip: CrewMember;
   onUpdate: () => void;
   onDelete: (id: number) => Promise<void>;
}

export function QuadsTrip({ trip, totalQuads, update }: QuadsTripProps) {
   const [openModal, setOpenModal] = useState(false);
   const [quads, setQuads] = useState<Quad[]>([]);
   const [loading, setLoading] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const { quadType } = useQuadsContext();
   const { push } = useToast();

   const userName = useMemo(
      () => `${trip.user.posto.short} ${trip.user.nome_guerra}`,
      [trip.user.posto.short, trip.user.nome_guerra]
   );

   const fetchQuads = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getQuadById(trip.id, quadType);
         setQuads(data);
      } catch (err) {
         console.error(err);
         push({
            message: "Erro ao carregar quadrinhos",
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   }, [trip.id, quadType, push]);

   const handleDelete = useCallback(
      async (quadId: number) => {
         try {
            const res = await deleteQuad(quadId);
            if (res.ok) {
               push({
                  message: "Quadrinho deletado com sucesso!",
                  type: "success",
               });
               setQuads((prev) => prev.filter((q) => q.id !== quadId));
               update();
            } else {
               const data = await res.json();
               push({
                  message: data.detail || "Erro ao deletar",
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
      [push, update]
   );

   const handleSuccess = useCallback(() => {
      fetchQuads();
      update();
      setShowForm(false);
   }, [fetchQuads, update]);

   const handleCloseModal = useCallback(() => {
      setOpenModal(false);
      setShowForm(false);
   }, []);

   useEffect(() => {
      if (openModal) {
         fetchQuads();
      }
   }, [openModal, fetchQuads]);

   const hasQuads = quads.length > 0;

   return (
      <>
         <Button
            color='light'
            onClick={() => setOpenModal(true)}
            className='inline-flex items-center w-[4rem] px-0 text-sm font-medium uppercase overflow-visible hover:bg-gray-100 transition-colors'
            size='sm'
            aria-label={`Ver quadrinhos de ${userName}`}
         >
            {trip.trig}
            <div
               className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 border-2 border-white rounded-full -top-2 -right-2'
               aria-label={`${totalQuads} quadrinhos`}
            >
               {totalQuads}
            </div>
         </Button>

         <Modal
            show={openModal}
            size='md'
            onClose={handleCloseModal}
            popup
            dismissible
         >
            <ModalHeader>Quadrinhos</ModalHeader>
            <ModalBody>
               <div className='mb-4 text-base text-center uppercase'>
                  <h3 className='font-medium text-gray-900 dark:text-white'>
                     {userName}
                  </h3>
               </div>

               <div className='h-96 overflow-y-auto shadow-lg rounded-lg bg-white dark:bg-gray-800'>
                  {loading ? (
                     <LoadingState />
                  ) : hasQuads ? (
                     <Table className='text-center' hoverable>
                        <TableHead>
                           <TableRow>
                              <TableHeadCell>Valor</TableHeadCell>
                              <TableHeadCell>Ações</TableHeadCell>
                           </TableRow>
                        </TableHead>
                        <TableBody className='divide-y'>
                           {quads.map((quad) => (
                              <QuadRow
                                 key={quad.id}
                                 quad={quad}
                                 trip={trip}
                                 onUpdate={handleSuccess}
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
                  <div className='flex justify-center mt-4'>
                     <Button
                        color='blue'
                        onClick={() => setShowForm(true)}
                        className='w-full sm:w-auto'
                     >
                        <FaPlus className='mr-2 h-4 w-4' />
                        Adicionar Quadrinho
                     </Button>
                  </div>
               </PermBased>

               <QuadForm
                  trip={trip}
                  show={showForm}
                  setShow={setShowForm}
                  onSuccess={handleSuccess}
               />
            </ModalBody>
         </Modal>
      </>
   );
}

function QuadRow({ quad, trip, onUpdate, onDelete }: QuadRowProps) {
   const [showForm, setShowForm] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const handleDeleteClick = useCallback(async () => {
      setShowDeleteConfirm(false);
      setDeleting(true);
      try {
         await onDelete(quad.id);
      } finally {
         setDeleting(false);
      }
   }, [quad.id, onDelete]);

   const handleEditSuccess = useCallback(() => {
      setShowForm(false);
      onUpdate();
   }, [onUpdate]);

   const displayValue = quad.value ? isoDateToString(quad.value) : "LASTRO";
   const canEdit = Boolean(quad.value);

   return (
      <>
         <TableRow className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
            <TableCell className='font-semibold text-center'>
               {displayValue}
            </TableCell>
            <TableCell>
               <div className='flex justify-center items-center gap-2'>
                  <PermBased resource={"quad"} requiredPerm={"create"}>
                     {canEdit && (
                        <button
                           onClick={() => setShowForm(true)}
                           className='p-2 hover:bg-blue-500 hover:text-white text-blue-500 cursor-pointer rounded-md transition-all duration-200 active:scale-95'
                           aria-label='Editar quadrinho'
                           disabled={deleting}
                        >
                           <FaEdit className='size-5' />
                        </button>
                     )}

                     {deleting ? (
                        <div className='p-2'>
                           <Spinner size='sm' />
                        </div>
                     ) : (
                        <button
                           onClick={() => setShowDeleteConfirm(true)}
                           className='p-2 hover:bg-red-500 hover:text-white text-red-500 cursor-pointer rounded-md transition-all duration-200 active:scale-95'
                           aria-label='Deletar quadrinho'
                        >
                           <FaRegTrashCan className='size-5' />
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
               onSuccess={handleEditSuccess}
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
      <div className='flex flex-col items-center justify-center h-full gap-3 p-4'>
         <Spinner size='lg' />
         <p className='text-sm text-gray-600 dark:text-gray-400'>
            Carregando quadrinhos...
         </p>
      </div>
   );
}

function EmptyState() {
   return (
      <div className='flex flex-col items-center justify-center h-full gap-3 p-8 text-center'>
         <div className='text-6xl text-gray-300 dark:text-gray-600'>📋</div>
         <h4 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
            Nenhum quadrinho encontrado
         </h4>
         <p className='text-sm text-gray-500 dark:text-gray-400'>
            Clique em &quot;Adicionar Quadrinho&quot; para começar
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
      <Modal show={show} size='sm' onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className='text-center'>
               <FaRegTrashCan className='mx-auto mb-4 h-14 w-14 text-red-500' />
               <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                  Tem certeza que deseja deletar este quadrinho?
               </h3>
               <div className='flex justify-center gap-4'>
                  <Button color='red' onClick={onConfirm}>
                     Sim, deletar
                  </Button>
                  <Button color='gray' onClick={onCancel}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
