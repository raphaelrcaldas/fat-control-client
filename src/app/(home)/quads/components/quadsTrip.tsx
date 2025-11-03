"use client";

import { Button, Modal, Table, Spinner } from "flowbite-react";
import { useState, useEffect, useCallback } from "react";
import { getQuadById } from "services/routes/quads";
import { isoDateToString } from "utils/dateHandler";
import { PermBased } from "../../hooks/usePermBased";
import { useQuadsContext } from "../../context/quads";
import { CrewMember } from "services/routes/trips";
import { Quad } from "services/routes/quads";
import QuadForm from "./quadForm";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { deleteQuad } from "services/routes/quads";
import { useToast } from "@/app/context/toast";

export function QuadsTrip({
   trip,
   totalQuads,
   update,
}: {
   trip: CrewMember;
   totalQuads: number;
   update: () => void;
}) {
   const [openModal, setOpenModal] = useState(false);
   const [quads, setQuads] = useState<Quad[]>([]);
   const [loading, setLoading] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const { quadType } = useQuadsContext();

   const getQuads = () => {
      setLoading(true);
      getQuadById(trip.id, quadType)
         .then((data) => setQuads(data))
         .catch((err) => {
            console.error(err);
         })
         .finally(() => setLoading(false));
   };

   useEffect(() => {
      if (openModal) {
         getQuads();
      }
   }, [openModal]);

   return (
      <>
         <Button
            color={"light"}
            onClick={() => setOpenModal(true)}
            className='inline-flex items-center w-[4rem] px-0 text-sm font-medium uppercase overflow-visible'
            size={"sm"}
         >
            {trip.trig}
            <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 border-2 rounded-full -top-2 -right-2 '>
               {totalQuads}
            </div>
         </Button>

         {openModal && (
            <Modal
               show={openModal}
               size='md'
               onClose={() => setOpenModal(false)}
               popup
            >
               <Modal.Header>Quadrinhos</Modal.Header>
               <Modal.Body>
                  <div className='m-4 text-base text-center uppercase'>
                     <h3 className='font-medium'>
                        {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
                     </h3>
                  </div>
                  <div className='h-96 overflow-y-auto shadow-lg rounded-lg'>
                     {loading ? (
                        <div className='grid h-full justify-items-center align-middle'>
                           <Spinner color='failure' size='lg' />
                           Carregando Quadrinhos...
                        </div>
                     ) : (
                        <Table className='text-center' hoverable>
                           <Table.Head>
                              <Table.HeadCell>Valor</Table.HeadCell>
                              <Table.HeadCell>Action</Table.HeadCell>
                           </Table.Head>
                           <Table.Body>
                              {quads.map((quad) => (
                                 <QuadRow
                                    key={quad.id}
                                    quad={quad}
                                    trip={trip}
                                    update={update}
                                 />
                              ))}
                           </Table.Body>
                        </Table>
                     )}
                  </div>
                  <div className='grid justify-center mt-4'>
                     <Button onClick={() => setShowForm(true)}>
                        Adicionar
                     </Button>

                     <QuadForm
                        trip={trip}
                        show={showForm}
                        setShow={setShowForm}
                        onSuccess={update}
                     />
                  </div>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}

function QuadRow({
   quad,
   trip,
   update,
}: {
   quad: Quad;
   trip: CrewMember;
   update: () => void;
}) {
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(false);
   const { push } = useToast();

   const handleDelete = useCallback(async () => {
      const confirm = window.confirm("Deseja deletar este quadrinho?");
      if (!confirm) return;
      setLoading(true);
      try {
         const res = await deleteQuad(quad.id);
         if (res.ok) {
            push({
               message: "Quadrinho deletado com sucesso!",
               type: "success",
            });
            update();
         } else {
            const data = await res.json();
            push({ message: data.detail || "Erro ao deletar", type: "error" });
         }
      } catch (err) {
         console.error(err);
         push({ message: (err as Error).message || "Erro", type: "error" });
      } finally {
         setLoading(false);
      }
   }, [quad]);

   return (
      <Table.Row>
         <Table.Cell className='font-semibold text-center'>
            {quad.value ? isoDateToString(quad.value) : "LASTRO"}
         </Table.Cell>
         <Table.Cell className='flex justify-center items-center gap-2'>
            {quad.value && (
               <>
                  <span
                     className='p-2 hover:bg-blue-500 hover:text-white text-blue-500 cursor-pointer rounded-md'
                     onClick={() => setShowForm(true)}
                  >
                     <FaEdit className='size-5' />
                  </span>
                  <QuadForm
                     show={showForm}
                     setShow={setShowForm}
                     trip={trip}
                     quad={quad}
                     onSuccess={update}
                  />
               </>
            )}
            {loading ? (
               <Spinner color='failure' aria-label='Loading spinner' />
            ) : (
               <span
                  onClick={handleDelete}
                  className='p-2 hover:bg-red-500 hover:text-white text-red-500 cursor-pointer rounded-md'
               >
                  <FaRegTrashCan className='size-5' />
               </span>
            )}
         </Table.Cell>
      </Table.Row>
   );
}
