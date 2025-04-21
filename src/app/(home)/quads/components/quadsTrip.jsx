"use client";

import { Button, Modal, Table } from "flowbite-react";
import { useState, useCallback, useEffect } from "react";
import { QuadUpdateModal } from "./quadUpdate";
import { getQuadById } from "@/services/routes/quads";
import { isoDateToString } from "@/utils/dateHandler";
import { PermBased } from "../../hooks/usePermBased";

const themeTable = {
   root: {
      base: "w-full text-base text-gray-500 uppercase text-center",
      shadow:
         "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white shadow-md",
      wrapper: "relative",
   },
   body: {
      base: "group/body",
      cell: {
         base: "px-0.5 py-2 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
      },
   },
   head: {
      base: "group/head text-xs text-gray-700 dark:text-gray-400",
      cell: {
         base: "bg-gray-200 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
      },
   },
   row: {
      base: "group/row bg-white hover:font-semibold",
      hovered: "hover:bg-gray-50",
      striped: "odd:bg-white even:bg-gray-50",
   },
};

const useQuads = (tripId, typeQuad) => {
   const [quads, setQuads] = useState([]);

   const getQuads = () => {
      getQuadById(tripId, { type_id: typeQuad })
         .then((res) => res.json())
         .then((data) => {
            setQuads(data);
         });
   };

   return [quads, getQuads];
};

export function QuadsTrip({ trip, typeQuad, lenTotalQuads, quadsAllUpdate }) {
   const [openModal, setOpenModal] = useState(false);
   const [quads, getQuads] = useQuads(trip.id, typeQuad);

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
                     {/* <h3 className='m-4'>{typeQuad}</h3> */}
                     <h2>{trip.trig}</h2>
                     <h3 className='font-semibold'>
                        {`${trip.user.posto.short} ${trip.user.esp} ${trip.user.nome_guerra}`}
                     </h3>
                  </div>
                  <div className='max-h-[45rem] overflow-y-auto shadow-lg rounded-lg'>
                     <Table theme={themeTable} hoverable>
                        <Table.Head>
                           <Table.HeadCell>#</Table.HeadCell>
                           <Table.HeadCell>VALOR</Table.HeadCell>
                           <Table.HeadCell>
                              <span className='sr-only'>Edit</span>
                           </Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                           {quads.map((quad) => {
                              return (
                                 <Table.Row key={quad.id}>
                                    <Table.Cell>{quad.id}</Table.Cell>
                                    <Table.Cell className="font-semibold">
                                       {quad.value
                                          ? isoDateToString(quad.value)
                                          : "LASTRO"}
                                    </Table.Cell>
                                    <Table.Cell className='grid justify-items-center'>
                                       <PermBased resource={"quad_ops"} requiredPerm={"create"}>
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
                  </div>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
