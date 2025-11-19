import { useState } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { IndispForm } from "./indispForm";
import { isoDateToString } from "utils/dateHandler";
import { getIndisp } from "./options";
import { PermBased } from "../../hooks/usePermBased";
import { CrewIndisp, IndispType } from "services/routes/indisps";

export const TripIndisp = ({
   trip,
   indisps,
   update,
}: {
   trip: CrewIndisp;
   indisps: IndispType[];
   update: () => void;
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const [isOpenNewInd, setIsOpenNewInd] = useState(false);

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   const user = trip.user;

   return (
      <>
         <Button
            color='light'
            className='uppercase w-[55px] p-0 h-10 text-sm font-medium overflow-visible hover:shadow-md transition-shadow'
            onClick={openModal}
            aria-label={`Ver indisponibilidades de ${trip.trig}`}
         >
            {trip.trig}
            {trip.func.oper == "in" && (
               <div
                  className='absolute size-4 border-2 bg-red-400 rounded-full -top-1 -end-1 animate-pulse'
                  aria-label='Instrutor'
               ></div>
            )}
         </Button>

         {isOpen && (
            <Modal show={isOpen} size='3xl' onClose={closeModal}>
               <ModalHeader>
                  <span className='text-lg font-bold'>Indisponibilidades</span>
               </ModalHeader>
               <ModalBody>
                  <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200'>
                     <h3 className='uppercase text-center font-bold text-gray-900 text-lg'>
                        {user.posto.short} {user.esp} {user.nome_guerra}
                     </h3>
                     <h3 className='uppercase text-center text-gray-600 text-sm mt-1'>
                        {user.nome_completo}
                     </h3>
                  </div>

                  {indisps.length > 0 ? (
                     <div className='mt-4 shadow-md rounded-lg overflow-hidden border border-gray-200'>
                        <Table hoverable className='text-center uppercase'>
                           <TableHead className='bg-gray-100'>
                              <TableRow>
                                 <TableHeadCell className='font-bold'>
                                    MOTIVO
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold'>
                                    OBS
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold'>
                                    INÍCIO
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold'>
                                    FIM
                                 </TableHeadCell>
                                 <TableHeadCell>
                                    <span className='sr-only'>Ações</span>
                                 </TableHeadCell>
                              </TableRow>
                           </TableHead>
                           <TableBody className='divide-y'>
                              {indisps.map((indisp) => (
                                 <TripIndispRow
                                    key={indisp.id}
                                    indisp={indisp}
                                    trip={trip}
                                    update={update}
                                 />
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  ) : (
                     <div className='mt-6 p-8 text-center bg-gray-50 rounded-lg border border-gray-200'>
                        <p className='text-gray-500 text-base'>
                           Nenhuma indisponibilidade registrada
                        </p>
                     </div>
                  )}
               </ModalBody>
               <ModalFooter className='flex justify-center gap-3 bg-gray-50'>
                  <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
                     <Button
                        color='blue'
                        size='md'
                        onClick={() => setIsOpenNewInd(true)}
                     >
                        + Adicionar Indisponibilidade
                     </Button>
                     <IndispForm
                        open={isOpenNewInd}
                        setOpen={setIsOpenNewInd}
                        trip={trip}
                        update={update}
                        indisp={null}
                     />
                  </PermBased>
                  <Button color='gray' size='md' onClick={closeModal}>
                     Fechar
                  </Button>
               </ModalFooter>
            </Modal>
         )}
      </>
   );
};

function TripIndispRow({ indisp, trip, update }) {
   const [openInd, setOpenInd] = useState(false);
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const indispProps = getIndisp(indisp.mtv);

   return (
      <TableRow>
         <TableCell className='p-1 font-semibold'>
            <span className={"rounded-md p-2 " + indispProps.color.bg}>
               {indispProps.value}
            </span>
         </TableCell>
         <TableCell className='p-1'>{indisp.obs}</TableCell>
         <TableCell className='p-1 font-semibold'>{dateStart}</TableCell>
         <TableCell className='p-1 font-semibold'>{dateEnd}</TableCell>
         <TableCell className='p-1'>
            <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
               <Button
                  pill
                  color='light'
                  size='sm'
                  onClick={() => setOpenInd(true)}
               >
                  Editar
               </Button>

               {openInd && (
                  <IndispForm
                     open={openInd}
                     setOpen={setOpenInd}
                     trip={trip}
                     update={update}
                     indisp={indisp}
                  />
               )}
            </PermBased>
         </TableCell>
      </TableRow>
   );
}
