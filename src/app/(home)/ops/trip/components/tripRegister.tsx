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
import type { CreateTripData } from "services/routes/trips";
import {
   isValidTrigramaKey,
   trigramaValidationRules,
} from "../utils/validateTrigrama";
import { FuncFields } from "./FuncFields";
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
      watch,
      formState: { errors },
   } = useForm<TripRegisterFormFields>({
      defaultValues: {
         user_id: user.id,
         active: true,
         trig: "",
         proj: "",
         data_op: "",
      },
   });

   const currentOper = watch("oper");

   useEffect(() => {
      if (show) {
         reset({
            user_id: user.id,
            active: true,
            trig: "",
            proj: "",
            data_op: "",
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
      const payload: CreateTripData = {
         user_id: data.user_id,
         active: data.active,
         trig: data.trig,
         func: data.func,
         oper: data.oper,
         proj: data.proj,
         data_op: data.data_op?.trim() || null,
      };

      createTripMutation.mutate(payload, {
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
            <Button color="red" onClick={() => setInternalShow(true)}>
               <HiUserAdd className="mr-2 size-5" />
               <span>Adicionar</span>
            </Button>
         )}

         <Modal show={show} size="lg" onClose={closeModal} dismissible>
            <ModalHeader>Cadastrar Tripulante</ModalHeader>
            <ModalBody>
               <form
                  onSubmit={handleSubmit(registerTrip)}
                  className="space-y-4"
               >
                  <div className="rounded border border-red-200 bg-red-50 p-4 text-center text-base uppercase">
                     <div className="font-semibold text-slate-800">
                        {`${user.posto.short} ${user.quadro ?? ""} ${user.esp ?? ""} ${user.nome_guerra}`}
                     </div>
                     <div className="mt-1 text-sm text-slate-600 capitalize">
                        {user.nome_completo}
                     </div>
                     <div className="mt-1 text-sm font-semibold text-slate-500">
                        {user.unidade}
                     </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
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
                           <p className="mt-1 text-sm text-red-600">
                              {errors.trig?.message}
                           </p>
                        )}
                     </div>
                  </div>

                  <div className="rounded border border-slate-200 bg-slate-50 p-4">
                     <h4 className="mb-3 text-sm font-semibold text-slate-700">
                        Função do Tripulante
                     </h4>
                     <FuncFields
                        register={register}
                        errors={errors}
                        currentOper={currentOper}
                     />
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
                              <Spinner size="sm" color="primary" />
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
