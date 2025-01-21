import { useState } from "react";
import { Modal, Button, Label, TextInput, Textarea } from "flowbite-react";
import { indispsOptions } from "./infoIndisps";
import { addIndisp } from "../../../../../services/routes/indisps";

export const AddIndisp = ({ trip, update, indisp }) => {
   const [isOpen, setIsOpen] = useState(false);

   const [mtv, setMtv] = useState("");
   const [dateStart, setDateStart] = useState("");
   const [dateEnd, setDateEnd] = useState("");
   const [obs, setObs] = useState("");

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   const clearModal = () => {
      setMtv("");
      setDateStart("");
      setDateEnd("");
      setObs("");
   };

   const onAddIndisp = async () => {
      const invalidStart = isNaN(new Date(dateStart));
      const invalidEnd = isNaN(new Date(dateEnd));
      const invalidMtv = mtv == "";

      if (invalidStart) {
         window.alert("Insira um data de início válida!");
      }
      if (invalidEnd) {
         window.alert("Insira um data final válida!");
      }
      if (invalidMtv) {
         window.alert("Escolha um motivo");
      }

      const compareDates = new Date(dateStart) > new Date(dateEnd);
      if (compareDates) {
         window.alert("A data de inicio não deve ser maior que a data final");
      }

      if (!invalidStart && !invalidEnd && !invalidMtv && !compareDates) {
         const indisp = {
            user_id: trip.user.id,
            mtv: mtv,
            date_start: dateStart,
            date_end: dateEnd,
            obs: obs,
         };

         const response = await addIndisp(indisp);
         const data = await response.json();

         window.alert(data.detail);

         if (response.ok) {
            setIsOpen(false);
            clearModal();
            update();
         }
      }
   };

   return (
      <>
         <Button onClick={openModal}>Adicionar</Button>

         {isOpen && (
            <Modal show={isOpen} size='md' onClose={closeModal}>
               <Modal.Header>Indisponibilidade</Modal.Header>
               <Modal.Body>
                  <div className='mt-6 grid gap-4 justify-items-center text-center'>
                     <div className='w-1/2'>
                        <select
                           value={mtv}
                           onChange={(e) => setMtv(e.target.value)}
                           className='bg-gray-50 text-center border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                           <option value='' disabled>
                              Motivo
                           </option>
                           {indispsOptions.map((item, index) => {
                              return (
                                 <option key={index} value={item.value}>
                                    {item.label}
                                 </option>
                              );
                           })}
                        </select>
                     </div>

                     <div className='flex w-full'>
                        <div className='px-2 w-full'>
                           <Label className='mb-2 block' value='Início' />
                           <TextInput
                              className='text-sm text-gray-900'
                              type='date'
                              autoComplete='off'
                              value={dateStart}
                              onChange={(e) => setDateStart(e.target.value)}
                           />
                        </div>
                        <div className='px-2 w-full'>
                           <Label className='mb-2 block' value='Fim' />
                           <TextInput
                              className='text-sm text-gray-900'
                              type='date'
                              autoComplete='off'
                              value={dateEnd}
                              onChange={(e) => setDateEnd(e.target.value)}
                           />
                        </div>
                     </div>
                     <div className='mt-6 w-full rounded-lg shadow-md'>
                        <Textarea
                           className='text-base'
                           placeholder='Observações'
                           value={obs}
                           onChange={(e) => setObs(e.target.value)}
                        />
                     </div>
                  </div>
               </Modal.Body>
               <Modal.Footer className='grid justify-items-center'>
                  <Button onClick={onAddIndisp}>Adicionar</Button>
               </Modal.Footer>
            </Modal>
         )}
      </>
   );
};
