import { useState } from "react";
import { Modal, Button, Label, TextInput, Textarea } from "flowbite-react";
import { indispsOptions } from "./infoIndisps";
import {
   addIndisp,
   updateIndisp,
   deleteIndisp,
} from "../../../../../services/routes/indisps";

function IndispForm({ open, setOpen, trip, update, indisp }) {
   const [mtv, setMtv] = useState(indisp ? indisp.mtv : "");
   const [dateStart, setDateStart] = useState(indisp ? indisp.date_start : "");
   const [dateEnd, setDateEnd] = useState(indisp ? indisp.date_end : "");
   const [obs, setObs] = useState(indisp ? indisp.obs : "");

   const closeModal = () => setOpen(false);

   const clearModal = () => {
      setMtv("");
      setDateStart("");
      setDateEnd("");
      setObs("");
   };

   const handleDelIndisp = async () => {
      const checkExclude = window.confirm(
         "Deseja excluir essa Indisponibilidade?"
      );

      if (checkExclude) {
         console.log(checkExclude);
         const response = await deleteIndisp(indisp.id);
         const rData = await response.json();

         if (response.ok) {
            window.alert(rData.detail);
            setOpen(false);
            update();
         }
      }
   };

   const validateForm = () => {
      const invalidStart = isNaN(new Date(dateStart));
      const invalidEnd = isNaN(new Date(dateEnd));
      const invalidMtv = mtv == "";
      const compareDates = new Date(dateStart) > new Date(dateEnd);

      let msg = [];

      if (invalidStart) {
         msg.push("- Insira um data de início válida!");
      }
      if (invalidEnd) {
         msg.push("- Insira um data final válida!");
      }
      if (invalidMtv) {
         msg.push("- Escolha um motivo");
      }
      if (compareDates) {
         msg.push("A data de inicio não deve ser maior que a data final");
      }

      msg.length != 0 && window.alert(msg.join("\n"));

      return !invalidStart && !invalidEnd && !invalidMtv && !compareDates;
   };

   const handleIndisp = async () => {
      if (validateForm()) {
         let data = {
            mtv: mtv,
            date_start: dateStart,
            date_end: dateEnd,
            obs: obs,
         };

         let response;
         if (indisp) {
            data.id = indisp.id;
            response = await updateIndisp(data);
         } else {
            data.user_id = trip.user.id;
            response = await addIndisp(data);
         }

         const rdata = await response.json();

         window.alert(rdata.detail);

         if (response.ok) {
            setOpen(false);
            clearModal();
            update();
         }
      }
   };

   return (
      <Modal show={open} size='md' onClose={closeModal}>
         <Modal.Header>
            {indisp ? "Atualizar" : "Adicionar"} Indisponibilidade
         </Modal.Header>
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
         <Modal.Footer className='flex gap-2 justify-center'>
            <Button onClick={handleIndisp}>
               {indisp ? "Atualizar" : "Adicionar"}
            </Button>
            {indisp && (
               <Button onClick={handleDelIndisp} color='failure'>
                  Excluir
               </Button>
            )}
         </Modal.Footer>
      </Modal>
   );
}

export function EditIndisp({ trip, update, indisp }) {
   const [open, setOpen] = useState(false);

   return (
      <>
         <Button pill color='light' size='sm' onClick={() => setOpen(true)}>
            Editar
         </Button>

         {open && (
            <IndispForm
               open={open}
               setOpen={setOpen}
               trip={trip}
               update={update}
               indisp={indisp}
            />
         )}
      </>
   );
}

export function NewIndisp({ trip, update }) {
   const [open, setOpen] = useState(false);

   return (
      <>
         <Button size='md' onClick={() => setOpen(true)}>
            Adicionar
         </Button>

         {open && (
            <IndispForm
               open={open}
               setOpen={setOpen}
               trip={trip}
               update={update}
            />
         )}
      </>
   );
}
