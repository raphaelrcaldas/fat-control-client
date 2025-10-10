"use client";

import { Button, Modal, Table, Spinner } from "flowbite-react";
import { useState, useCallback, useEffect } from "react";
import { QuadUpdateModal } from "./quadUpdate";
import { getQuadById } from "services/routes/quads";
import { isoDateToString } from "utils/dateHandler";
import { PermBased } from "../../hooks/usePermBased";

const useQuads = (tripId, typeQuad) => {
   const [quads, setQuads] = useState([]);
   const [loading, setLoading] = useState(false);

   const getQuads = () => {
      setLoading(true);
      getQuadById(tripId, { type_id: typeQuad })
         .then((res) => res.json())
         .then((data) => {
            setQuads(data);
         })
         .catch((err) => {
            console.error(err);
         })
         .finally(() => setLoading(false));
   };

   return [quads, getQuads, loading];
};

export function QuadsTrip({ trip, typeQuad, lenTotalQuads, quadsAllUpdate }) {
   const [openModal, setOpenModal] = useState(false);
   const [quads, getQuads, loading] = useQuads(trip.id, typeQuad);

   useEffect(() => {
      if (openModal) {
         getQuads();
      }
   }, [openModal]);

   const handleOpenModal = useCallback(() => setOpenModal(true), []);
   const handleCloseModal = useCallback(() => setOpenModal(false), []);

   return (
      <>
         <Button
            color={"light"}
            onClick={handleOpenModal}
            className='inline-flex items-center w-[4rem] px-0 text-sm font-medium uppercase overflow-visible'
            size={"sm"}
         >
            {trip.trig}
            <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 border-2 rounded-full -top-2 -right-2 '>
               {lenTotalQuads}
            </div>
         </Button>

         {openModal && (
            <Modal show={openModal} size='md' onClose={handleCloseModal} popup>
               <Modal.Header>Quadrinhos</Modal.Header>
               <Modal.Body>
                  <div className='m-4 text-base text-center uppercase'>
                     <h3 className='font-medium'>
                        {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
                     </h3>
                  </div>
                  <div className='min-h-72 max-h-[35rem] overflow-y-auto shadow-lg rounded-lg'>
                     {loading ? (
                        <div className='grid h-full justify-items-center align-middle'>
                           <Spinner color='failure' size='lg' />
                           Carregando Quadrinhos...
                        </div>
                     ) : (
                        <Table hoverable>
                           <Table.Head>
                              <Table.HeadCell className='text-center'>
                                 VALOR
                              </Table.HeadCell>
                              <Table.HeadCell>
                                 <span className='sr-only'>Edit</span>
                              </Table.HeadCell>
                           </Table.Head>
                           <Table.Body>
                              {quads.map((quad) => {
                                 return (
                                    <Table.Row key={quad.id}>
                                       <Table.Cell className='font-semibold text-center'>
                                          {quad.value
                                             ? isoDateToString(quad.value)
                                             : "LASTRO"}
                                       </Table.Cell>
                                       <Table.Cell className='grid justify-items-center'>
                                          <PermBased
                                             resource={"quad_ops"}
                                             requiredPerm={"update"}
                                          >
                                             <QuadUpdateModal
                                                quad={quad}
                                                tridId={trip.id}
                                                updateQuadsTrip={getQuads}
                                                quadsAllUpdate={quadsAllUpdate}
                                             />
                                          </PermBased>
                                       </Table.Cell>
                                    </Table.Row>
                                 );
                              })}
                           </Table.Body>
                        </Table>
                     )}
                  </div>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
