import { useState, useEffect } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
   Spinner,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { HiUserAdd } from "react-icons/hi";
import { addTrip } from "services/routes/trips";
import { useToast } from "../../../context/toast";
import { UserPublic } from "services/routes/users";

type TripFormFields = {
   user_id: number;
   active: boolean;
   uae: string;
   trig: string;
};

type TripRegisterProps = {
   uae: string;
   user: UserPublic;
   update: () => void;
   show?: boolean;
   onClose?: () => void;
};

export function TripRegister({
   uae,
   user,
   update,
   show: externalShow,
   onClose: externalOnClose,
}: TripRegisterProps) {
   const [internalShow, setInternalShow] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const { push } = useToast();

   const show = externalShow !== undefined ? externalShow : internalShow;
   
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<TripFormFields>({
      defaultValues: {
         user_id: user.id,
         active: true,
         uae: uae,
         trig: "",
      },
   });

   useEffect(() => {
      if (show) {
         reset({
            user_id: user.id,
            active: true,
            uae: uae,
            trig: "",
         });
      }
   }, [show, user.id, uae, reset]);

   function closeModal() {
      reset();
      if (externalOnClose) {
         externalOnClose();
      } else {
         setInternalShow(false);
      }
   }

   async function registerTrip(data: TripFormFields) {
      setSubmitting(true);

      try {
         const response = await addTrip(data);
         const dataRes = await response.json();

         if (response.ok) {
            push({
               type: "success",
               message: "Tripulante adicionado com sucesso!",
            });
            update();
            closeModal();
         } else {
            push({
               type: "error",
               message: dataRes.detail || "Erro ao adicionar tripulante.",
            });
         }
      } catch (error) {
         push({
            type: "error",
            message: "Erro ao adicionar tripulante. Tente novamente.",
         });
      } finally {
         setSubmitting(false);
      }
   }

   return (
      <>
         {externalShow === undefined && (
            <button
               className='flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 transition-colors'
               onClick={() => setInternalShow(true)}
            >
               <HiUserAdd className='size-5' />
               <span>Adicionar</span>
            </button>
         )}

         <Modal show={show} size='md' onClose={closeModal}>
            <ModalHeader>Cadastrar Tripulante</ModalHeader>
            <ModalBody>
               <form
                  onSubmit={handleSubmit(registerTrip)}
                  className='space-y-4'
               >
                  <div className='p-4 text-base uppercase text-center bg-blue-50 rounded-lg border border-blue-200'>
                     <div className='font-semibold text-gray-800'>
                        {`${user.posto.short} ${user.esp} ${user.nome_guerra}`}
                     </div>
                     <div className='text-sm text-gray-600 mt-1 capitalize'>
                        {user.nome_completo}
                     </div>
                     <div className='text-sm text-gray-500 mt-1 font-medium'>
                        {user.unidade}
                     </div>
                  </div>

                  <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                     <div className='flex flex-col gap-2'>
                        <Label htmlFor='trig' className='text-sm font-semibold'>
                           Trigrama <span className='text-red-500'>*</span>
                        </Label>
                        <TextInput
                           id='trig'
                           {...register("trig", {
                              required: "Trigrama é obrigatório",
                              setValueAs: (t) => t.toLowerCase(),
                              minLength: {
                                 value: 3,
                                 message: "Trigrama deve ter 3 letras",
                              },
                              maxLength: {
                                 value: 3,
                                 message: "Trigrama deve ter 3 letras",
                              },
                           })}
                           autoComplete='off'
                           placeholder='Ex: abc'
                           maxLength={3}
                           autoFocus
                           color={errors.trig ? "failure" : "gray"}
                           onKeyDown={(e) => {
                              if (
                                 !e.key.match(/^[a-zA-Z]$/) &&
                                 e.key !== "Backspace" &&
                                 e.key !== "Delete" &&
                                 e.key !== "Tab" &&
                                 e.key !== "ArrowLeft" &&
                                 e.key !== "ArrowRight" &&
                                 e.key !== "Home" &&
                                 e.key !== "End"
                              ) {
                                 e.preventDefault();
                              }
                           }}
                        />
                        {errors.trig && (
                           <p className='text-xs text-gray-500'>
                              {errors.trig?.message}
                           </p>
                        )}
                     </div>
                  </div>

                  <div className='flex gap-3 justify-center pt-2'>
                     <Button
                        color='gray'
                        onClick={closeModal}
                        disabled={submitting}
                     >
                        Cancelar
                     </Button>
                     <Button color='blue' type='submit' disabled={submitting}>
                        {submitting ? (
                           <div className='flex items-center gap-2'>
                              <Spinner size='sm' />
                              <span>Salvando...</span>
                           </div>
                        ) : (
                           <div className='flex items-center gap-2'>
                              <HiUserAdd className='size-5' />
                              <span>Cadastrar</span>
                           </div>
                        )}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>
      </>
   );
}
