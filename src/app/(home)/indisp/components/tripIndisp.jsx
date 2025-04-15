import { useState } from "react";
import { Modal, Button, Table } from "flowbite-react";
import { EditIndisp, NewIndisp } from "./indispForm";
import { isoDateToString } from "@/utils/dateHandler";
import { getIndisp } from "./options";
import { PermBased } from "../../hooks/usePermBased";

export const TripIndisp = ({ trip, indisps, update }) => {
   const [isOpen, setIsOpen] = useState(false);

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   return (
      <>
         <Button
            color='light'
            className='uppercase w-[55px] p-0 h-10 text-sm font-medium overflow-visible'
            onClick={openModal}
         >
            {trip.trig}
            {trip.func.oper == "in" && (
               <div className='absolute size-4 border-2 bg-red-400 rounded-full -top-1 -end-1'></div>
            )}
         </Button>

         {isOpen && (
            <Modal show={isOpen} size='lg' onClose={closeModal}>
               <Modal.Header>Indisponibilidades</Modal.Header>
               <Modal.Body>
                  <h3 className='uppercase text-center font-semibold'>
                     {trip.user.posto.short} {trip.user.nome_guerra}
                  </h3>

                  {indisps.length > 0 ? (
                     <div className='mt-6 shadow-md rounded-lg'>
                        <Table hoverable className='text-center uppercase'>
                           <Table.Head>
                              <Table.HeadCell className='p-3'>
                                 ID
                              </Table.HeadCell>
                              <Table.HeadCell>MOTIVO</Table.HeadCell>
                              <Table.HeadCell>INICIO</Table.HeadCell>
                              <Table.HeadCell>FIM</Table.HeadCell>
                              <Table.HeadCell>
                                 <span className='sr-only'>Edit</span>
                              </Table.HeadCell>
                           </Table.Head>
                           <Table.Body>
                              {indisps.map((indisp) => {
                                 const dateStart = isoDateToString(
                                    indisp.date_start
                                 );
                                 const dateEnd = isoDateToString(
                                    indisp.date_end
                                 );
                                 const indispProps = getIndisp(indisp.mtv);

                                 return (
                                    <Table.Row key={indisp.id}>
                                       <Table.Cell className='p-1'>
                                          {indisp.id}
                                       </Table.Cell>
                                       <Table.Cell className='p-1 font-semibold'>
                                          <span
                                             className={
                                                "rounded-md p-2 " +
                                                indispProps.color.bg
                                             }
                                          >
                                             {indispProps.label}
                                          </span>
                                       </Table.Cell>
                                       <Table.Cell className='p-1'>
                                          {dateStart}
                                       </Table.Cell>
                                       <Table.Cell className='p-1'>
                                          {dateEnd}
                                       </Table.Cell>
                                       <Table.Cell className='p-1'>
                                          <PermBased
                                             requiredPerm={"create"}
                                             resource={"indisp_trips"}
                                          >
                                             <EditIndisp
                                                trip={trip}
                                                update={update}
                                                indisp={indisp}
                                             />
                                          </PermBased>
                                       </Table.Cell>
                                    </Table.Row>
                                 );
                              })}
                           </Table.Body>
                        </Table>
                     </div>
                  ) : (
                     <p className='mt-2 text-center'>
                        Não há indisponibilidades
                     </p>
                  )}
               </Modal.Body>
               <Modal.Footer className='grid justify-items-center'>
                  <NewIndisp update={update} trip={trip} />
               </Modal.Footer>
            </Modal>
         )}
      </>
   );
};
