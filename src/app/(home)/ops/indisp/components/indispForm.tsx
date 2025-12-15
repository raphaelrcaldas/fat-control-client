"use client";

import { useState, useMemo, useEffect } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Textarea,
   TextInput,
} from "flowbite-react";
import { format } from "date-fns";
import { HiOutlineExclamationCircle } from "react-icons/hi";

import { indispsOptions } from "./options";
import {
   addIndisp,
   updateIndisp,
   deleteIndisp,
   IndispType,
} from "services/routes/indisps";
import { useToast } from "@/app/context/toast";

export function IndispForm({ open, setOpen, trip, update, indisp }) {
   const { push } = useToast();
   const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para o modal de confirmação

   // 1. Gerenciamento de estado com useState
   const defaultValues = useMemo(() => {
      const today = format(new Date(), "yyyy-MM-dd");
      return {
         mtv: indisp ? indisp.mtv : "",
         dateStart: indisp ? indisp.date_start : today,
         dateEnd: indisp ? indisp.date_end : today,
         obs: indisp ? indisp.obs : "",
      };
   }, [indisp]);

   const [mtv, setMtv] = useState(defaultValues.mtv);
   const [dateStart, setDateStart] = useState(defaultValues.dateStart);
   const [dateEnd, setDateEnd] = useState(defaultValues.dateEnd);
   const [obs, setObs] = useState(defaultValues.obs);

   // Efeito para atualizar os estados quando a indisponibilidade mudar
   useEffect(() => {
      setMtv(defaultValues.mtv);
      setDateStart(defaultValues.dateStart);
      setDateEnd(defaultValues.dateEnd);
      setObs(defaultValues.obs);
   }, [defaultValues]);

   // Efeito para sincronizar a data final com a inicial
   useEffect(() => {
      if (dateStart && dateEnd && dateEnd < dateStart) {
         setDateEnd(dateStart);
      }
   }, [dateStart]);

   const closeModal = () => setOpen(false);

   const clearModal = () => {
      setMtv(defaultValues.mtv);
      setDateStart(defaultValues.dateStart);
      setDateEnd(defaultValues.dateEnd);
      setObs(defaultValues.obs);
   };

   const isChanged =
      mtv !== defaultValues.mtv ||
      dateStart !== defaultValues.dateStart ||
      dateEnd !== defaultValues.dateEnd ||
      obs !== defaultValues.obs;

   // 2. Validação manual
   const validateForm = () => {
      const invalidStart = isNaN(new Date(dateStart).getTime());
      const invalidEnd = isNaN(new Date(dateEnd).getTime());
      const invalidMtv = mtv === "";
      const compareDates = new Date(dateStart) > new Date(dateEnd);

      let msg = [];
      if (invalidStart) msg.push("- Insira uma data de início válida!");
      if (invalidEnd) msg.push("- Insira uma data final válida!");
      if (invalidMtv) msg.push("- Escolha um motivo");
      if (compareDates)
         msg.push("- A data de início não deve ser maior que a data final");

      if (msg.length > 0) {
         push({
            title: "Campos Inválidos",
            message: msg.join("\n"),
            type: "error",
         });
         return false;
      }
      return true;
   };

   // 3. Submissão manual
   const handleIndisp = async () => {
      if (validateForm()) {
         const data: IndispType = {
            mtv,
            date_start: dateStart,
            date_end: dateEnd,
            obs,
         };

         try {
            let response: Response;
            if (indisp) {
               data.id = indisp.id;
               response = await updateIndisp(data);
            } else {
               data.user_id = trip.user.id;
               response = await addIndisp(data);
            }

            const rdata = await response.json();

            if (response.ok) {
               push({
                  message: rdata.detail || "Operação realizada com sucesso",
                  type: "success",
               });
               update();
               clearModal();
               closeModal();
            } else {
               push({
                  message: rdata.detail || "Erro na operação",
                  type: "error",
               });
            }
         } catch (err: any) {
            push({
               message: err?.message || "Falha na comunicação com o servidor.",
               type: "error",
            });
         }
      }
   };

   // 4. Lógica de exclusão com modal de confirmação
   const confirmDelete = async () => {
      if (!indisp?.id) return;
      setShowConfirmModal(false); // Fecha o modal de confirmação

      try {
         const response = await deleteIndisp(indisp.id);
         const rData = await response.json();

         if (response.ok) {
            push({
               message:
                  rData.detail || "Indisponibilidade excluída com sucesso",
               type: "success",
            });
            update();
            closeModal();
         } else {
            push({
               message: rData.detail || "Erro ao excluir indisponibilidade",
               type: "error",
            });
         }
      } catch (err: any) {
         push({
            message: err?.message || "Falha ao excluir indisponibilidade.",
            type: "error",
         });
      }
   };

   return (
      <>
         <Modal
            show={open}
            size='lg'
            onClose={() => {
               clearModal();
               closeModal();
            }}
         >
            <ModalHeader>
               <div className='flex flex-col'>
                  <span className='font-bold text-lg'>
                     {indisp ? "Atualizar" : "Adicionar"} Indisponibilidade
                  </span>
                  {indisp && (
                     <span className='text-sm font-normal text-gray-500'>
                        ID: {indisp.id}
                     </span>
                  )}
               </div>
            </ModalHeader>
            <ModalBody>
               <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200'>
                  <h3 className='uppercase text-center font-bold text-gray-900 text-lg'>
                     {trip.user.posto.short} {trip.user.esp}{" "}
                     {trip.user.nome_guerra}
                  </h3>
                  <h3 className='uppercase text-center text-gray-600 text-sm mt-1'>
                     {trip.user.nome_completo}
                  </h3>
               </div>

               <div className='grid gap-5'>
                  <div className='grid gap-2'>
                     <Label
                        htmlFor='mtv'
                        className='font-semibold text-gray-700'
                     >
                        Motivo <span className='text-red-500'>*</span>
                     </Label>
                     <Select
                        id='mtv'
                        className='w-full'
                        value={mtv}
                        onChange={(e) => setMtv(e.target.value)}
                        required
                     >
                        <option value='' disabled>
                           Selecione um motivo
                        </option>
                        {indispsOptions.map((item) => (
                           <option key={item.value} value={item.value}>
                              {item.label}
                           </option>
                        ))}
                     </Select>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                     <div className='grid gap-2'>
                        <Label
                           htmlFor='date_start'
                           className='font-semibold text-gray-700'
                        >
                           Data de Início{" "}
                           <span className='text-red-500'>*</span>
                        </Label>
                        <TextInput
                           id='date_start'
                           type='date'
                           value={dateStart}
                           onChange={(e) => setDateStart(e.target.value)}
                           required
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label
                           htmlFor='date_end'
                           className='font-semibold text-gray-700'
                        >
                           Data de Fim <span className='text-red-500'>*</span>
                        </Label>
                        <TextInput
                           id='date_end'
                           type='date'
                           value={dateEnd}
                           min={dateStart}
                           onChange={(e) => setDateEnd(e.target.value)}
                           required
                        />
                     </div>
                  </div>

                  <div className='grid gap-2'>
                     <Label
                        htmlFor='obs'
                        className='font-semibold text-gray-700'
                     >
                        Observações
                     </Label>
                     <Textarea
                        id='obs'
                        placeholder='Detalhes adicionais sobre a indisponibilidade...'
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        rows={4}
                     />
                  </div>
               </div>
            </ModalBody>
            <ModalFooter className='bg-gray-50 flex justify-center gap-3'>
               <Button
                  color='blue'
                  onClick={handleIndisp}
                  disabled={indisp ? !isChanged : false}
                  size='md'
               >
                  {indisp ? "Atualizar" : "Adicionar"}
               </Button>
               {indisp && (
                  <Button
                     type='button'
                     onClick={() => setShowConfirmModal(true)}
                     color='red'
                     size='md'
                  >
                     Excluir
                  </Button>
               )}
               <Button
                  color='gray'
                  onClick={() => {
                     clearModal();
                     closeModal();
                  }}
                  size='md'
               >
                  Cancelar
               </Button>
            </ModalFooter>
         </Modal>

         <Modal
            show={showConfirmModal}
            size='md'
            onClose={() => setShowConfirmModal(false)}
            popup
         >
            <ModalHeader />
            <ModalBody>
               <div className='text-center'>
                  <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
                  <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                     Tem certeza que deseja excluir esta indisponibilidade?
                  </h3>
                  <div className='flex justify-center gap-4'>
                     <Button color='red' onClick={confirmDelete}>
                        Sim, excluir
                     </Button>
                     <Button
                        color='light'
                        onClick={() => setShowConfirmModal(false)}
                     >
                        Não, cancelar
                     </Button>
                  </div>
               </div>
            </ModalBody>
         </Modal>
      </>
   );
}
