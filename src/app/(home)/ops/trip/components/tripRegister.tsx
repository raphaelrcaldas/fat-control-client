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
import { useCreateTrip } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { UserPublic } from "services/routes/users";
import {
   isValidTrigramaKey,
   trigramaValidationRules,
} from "../utils/validateTrigrama";
import type { TripRegisterFormFields } from "../types/trip.types";

type TripRegisterProps = {
   user: UserPublic;
   show?: boolean;
   onClose?: () => void;
};

export function TripRegister({
   user,
   show: externalShow,
   onClose: externalOnClose,
}: TripRegisterProps) {
   const [internalShow, setInternalShow] = useState(false);
   const { push } = useToast();
   const createTripMutation = useCreateTrip();

   const show = externalShow !== undefined ? externalShow : internalShow;

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<TripRegisterFormFields>({
      defaultValues: {
         user_id: user.id,
         active: true,
         trig: "",
      },
   });

   useEffect(() => {
      if (show) {
         reset({
            user_id: user.id,
            active: true,
            trig: "",
         });
      }
   }, [show, user.id, reset]);

   function closeModal() {
      reset();
      if (externalOnClose) {
         externalOnClose();
      } else {
         setInternalShow(false);
      }
   }

   async function registerTrip(data: TripRegisterFormFields) {
      createTripMutation.mutate(data, {
         onSuccess: (result) => {
            if (result.ok) {
               push({
                  type: "success",
                  message: "Tripulante adicionado com sucesso!",
               });
               closeModal();
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao adicionar tripulante.",
               });
            }
         },
         onError: () => {
            push({
               type: "error",
               message: "Erro ao adicionar tripulante. Tente novamente.",
            });
         },
      });
   }

   return (
      <>
         {externalShow === undefined && (
            <button
               className="flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 focus:ring-4 focus:ring-red-300"
               onClick={() => setInternalShow(true)}
            >
               <HiUserAdd className="size-5" />
               <span>Adicionar</span>
            </button>
         )}

         <Modal show={show} size="md" onClose={closeModal} dismissible>
            <ModalHeader>Cadastrar Tripulante</ModalHeader>
            <ModalBody>
               <form
                  onSubmit={handleSubmit(registerTrip)}
                  className="space-y-4"
               >
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base uppercase">
                     <div className="font-semibold text-gray-800">
                        {`${user.posto.short} ${user.esp} ${user.nome_guerra}`}
                     </div>
                     <div className="mt-1 text-sm text-gray-600 capitalize">
                        {user.nome_completo}
                     </div>
                     <div className="mt-1 text-sm font-semibold text-gray-500">
                        {user.unidade}
                     </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="trig" className="text-sm font-semibold">
                           Trigrama <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="trig"
                           {...register("trig", {
                              ...trigramaValidationRules,
                              setValueAs: (t) => t.toLowerCase(),
                           })}
                           autoComplete="off"
                           placeholder="Ex: abc"
                           maxLength={3}
                           autoFocus
                           color={errors.trig ? "failure" : "gray"}
                           onKeyDown={(e) => {
                              if (!isValidTrigramaKey(e.key)) {
                                 e.preventDefault();
                              }
                           }}
                        />
                        {errors.trig && (
                           <p className="text-xs text-gray-500">
                              {errors.trig?.message}
                           </p>
                        )}
                     </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                     <Button
                        color="gray"
                        onClick={closeModal}
                        disabled={createTripMutation.isPending}
                     >
                        Cancelar
                     </Button>
                     <Button
                        color="red"
                        type="submit"
                        disabled={createTripMutation.isPending}
                     >
                        {createTripMutation.isPending ? (
                           <div className="flex items-center gap-2">
                              <Spinner size="sm" color="failure" />
                              <span>Salvando...</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2">
                              <HiUserAdd className="size-5" />
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
