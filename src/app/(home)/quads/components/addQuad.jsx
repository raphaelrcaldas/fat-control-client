import { VscAdd } from "react-icons/vsc";
import { useState, useCallback } from "react";
import {
   Button,
   Label,
   Modal,
   Textarea,
   TextInput,
   Select,
} from "flowbite-react";
import { addQuad } from "@/services/routes/quads";

export default function AddQuadModal({ trip, type, callFunc }) {
   const [openModal, setOpenModal] = useState(false);
   const [date, setDate] = useState("");
   const [obs, setObs] = useState("");
   const [lastro, setLastro] = useState(0);

   const [inputType, setInputType] = useState("data");

   const cleanModal = useCallback(() => {
      setDate("");
      setObs("");
      setLastro(0);
   }, []);

   const onClose = useCallback(() => {
      cleanModal();
      setOpenModal(false);
   }, [cleanModal]);

   async function handleAddQuad() {
      const quad = {
         trip_id: trip.id,
         value: inputType === "data" ? date : null,
         description: obs,
         type_id: type,
      };

      if (lastro > 0 || date != "") {
         const quads = lastro > 0 ? Array(lastro).fill(quad) : [quad];

         const response = await addQuad(quads);
         const dataRes = await response.json();

         if (response.ok) {
            alert("Inserido com sucesso!");
            cleanModal();
            callFunc();
         } else {
            alert(dataRes.detail);
         }
      } else {
         alert("Insira lastros ou uma data");
      }
   }

   const handleLastroChange = (e) => {
      const value = parseInt(e.target.value, 10);
      setLastro(value < 0 ? 0 : value);
   };

   return (
      <>
         <VscAdd
            className='w-5 h-5 p-0 cursor-pointer flex-shrink-0'
            onClick={() => setOpenModal(true)}
         />

         <Modal
            className=''
            show={openModal}
            size='sm'
            onClose={() => onClose()}
            popup
         >
            <Modal.Header children={"Adicionar Quadrinho"} />
            <Modal.Body>
               <div className='font-semibold text-center uppercase'>
                  <h3>
                     {`${trip.user.posto.short} ${trip.user.nome_guerra} `}
                  </h3>
                  <h3>{`${trip.func.func} ${trip.func.oper}`}</h3>
                  <h3>{`${trip.func.proj}`}</h3>
               </div>

               <div className='grid justify-center gap-4 mt-6 text-center'>
                  <div className='grid justify-center py-4 rounded-lg shadow-md w-60 bg-gray-50'>
                     <div className='flex items-center gap-4'>
                        <div>
                           <Label
                              className='block mb-2'
                              value='Tipo de Entrada'
                           />
                           <Select
                              value={inputType}
                              onChange={(e) => setInputType(e.target.value)}
                           >
                              <option value='data'>Data</option>
                              <option value='lastro'>Lastro</option>
                           </Select>
                        </div>
                     </div>
                  </div>

                  {inputType === "data" && (
                     <div className='grid justify-center py-4 rounded-lg shadow-md w-60 bg-gray-50'>
                        <div className='flex items-center gap-4'>
                           <div>
                              <TextInput
                                 value={date}
                                 onChange={(e) => setDate(e.target.value)}
                                 className='text-sm text-gray-900'
                                 type='date'
                                 autoComplete='off'
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  {inputType === "lastro" && (
                     <div className='grid justify-center py-4 rounded-lg shadow-md w-60 bg-gray-50'>
                        <div className='flex items-center gap-4'>
                           <div>
                              <TextInput
                                 value={lastro}
                                 onChange={handleLastroChange}
                                 className='w-20 text-sm text-gray-900'
                                 type='number'
                                 autoComplete='off'
                              />
                           </div>
                        </div>
                     </div>
                  )}

                  <div className='mt-6 rounded-lg shadow-md w-60'>
                     <Textarea
                        // value={obs}
                        className='text-base'
                        onChange={(e) => setObs(e.target.value)}
                        placeholder='Observações'
                     />
                  </div>
               </div>

               <div className='grid justify-center mt-6'>
                  <Button onClick={handleAddQuad}>Adicionar</Button>
               </div>
            </Modal.Body>
         </Modal>
      </>
   );
}
