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
            className='uppercase w-[55px] p-0 h-10 text-sm font-medium overflow-visible'
            onClick={openModal}
         >
            {trip.trig}
            {trip.func.oper == "in" && (
               <div className='absolute size-4 border-2 bg-red-400 rounded-full -top-1 -end-1'></div>
            )}
         </Button>

         {isOpen && (
            <Modal show={isOpen} size='2xl' onClose={closeModal}>
               <ModalHeader>Indisponibilidades</ModalHeader>
               <ModalBody>
                  <h3 className='uppercase text-center font-semibold'>
                     {user.posto.mid} {user.esp} {user.nome_guerra}
                  </h3>
                  <h3 className='uppercase text-center text-slate-500'>
                     {user.nome_completo}
                  </h3>

                  {indisps.length > 0 ? (
                     <div className='mt-6 shadow-md rounded-lg'>
                        <Table hoverable className='text-center uppercase'>
                           <TableHead>
                              <TableRow>
                                 <TableHeadCell>MOTIVO</TableHeadCell>
                                 <TableHeadCell>OBS</TableHeadCell>
                                 <TableHeadCell>INICIO</TableHeadCell>
                                 <TableHeadCell>FIM</TableHeadCell>
                                 <TableHeadCell>
                                    <span className='sr-only'>Edit</span>
                                 </TableHeadCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
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
                     <p className='mt-2 text-center'>
                        Não há indisponibilidades
                     </p>
                  )}
               </ModalBody>
               <ModalFooter className='grid justify-items-center'>
                  <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
                     <Button
                        color="blue"
                        size='md'
                        onClick={() => setIsOpenNewInd(true)}
                     >
                        Adicionar
                     </Button>
                     <IndispForm
                        open={isOpenNewInd}
                        setOpen={setIsOpenNewInd}
                        trip={trip}
                        update={update}
                        indisp={null}
                     />
                  </PermBased>
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
            <PermBased requiredPerm={"update"} resource={"indisp_trips"}>
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
