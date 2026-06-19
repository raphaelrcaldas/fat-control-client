import {
   Modal,
   ModalHeader,
   ModalBody,
   Label,
   Select,
   TextInput,
   Button,
   Spinner,
} from "flowbite-react";
import { FaPlus } from "react-icons/fa";
import {
   TODAS_FUNCOES,
   getFuncLabel,
   OPER_LABELS,
} from "@/constants/tripulantes";
import { useFuncForm } from "../../hooks/useFuncForm";
import { isFuncAvailable } from "../../utils/checkFuncAvailability";
import type { Trip } from "../../types/trip.types";

type FuncAddModalProps = {
   show: boolean;
   onClose: () => void;
   trip: Trip;
};

export function FuncAddModal({ show, onClose, trip }: FuncAddModalProps) {
   const { register, handleSubmit, errors, submitting, currentOper } =
      useFuncForm({
         tripId: trip.id!,
         editingFunc: null,
         onClose,
      });

   const onFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
   };

   return (
      <Modal show={show} onClose={onClose} size="md" dismissible>
         <ModalHeader>Adicionar Função</ModalHeader>
         <ModalBody>
            <form onSubmit={onFormSubmit} className="space-y-4">
               {/* Informações do Tripulante */}
               <div className="rounded border border-red-200 bg-red-50 p-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase">
                     {`${trip.user.posto.short} ${trip.user.quadro ?? ""} ${trip.user.esp ?? ""} ${trip.user.nome_guerra}`}
                  </h3>
               </div>

               {/* Campos do Formulário */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                     <Label htmlFor="func" className="text-sm font-semibold">
                        Função <span className="text-red-500">*</span>
                     </Label>
                     <Select
                        id="func"
                        {...register("func", {
                           required: "Função é obrigatória",
                        })}
                        color={errors.func ? "failure" : "gray"}
                     >
                        <option value="">Selecione</option>
                        {TODAS_FUNCOES.filter((func) =>
                           isFuncAvailable(func, trip.funcs || [])
                        ).map((func) => (
                           <option key={func} value={func}>
                              {func.toUpperCase()} - {getFuncLabel(func)}
                           </option>
                        ))}
                     </Select>
                     {errors.func && (
                        <p className="text-sm text-red-600">
                           {errors.func.message}
                        </p>
                     )}
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="oper" className="text-sm font-semibold">
                        Operacionalidade <span className="text-red-500">*</span>
                     </Label>
                     <Select
                        id="oper"
                        {...register("oper", {
                           required: "Operacionalidade é obrigatório",
                        })}
                        color={errors.oper ? "failure" : "gray"}
                     >
                        <option value="">Selecione</option>
                        {Object.entries(OPER_LABELS).map(([key, label]) => (
                           <option key={key} value={key}>
                              {key.toUpperCase()} - {label}
                           </option>
                        ))}
                     </Select>
                     {errors.oper && (
                        <p className="text-sm text-red-600">
                           {errors.oper.message}
                        </p>
                     )}
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="proj" className="text-sm font-semibold">
                        Projeto <span className="text-red-500">*</span>
                     </Label>
                     <Select
                        id="proj"
                        disabled
                        {...register("proj", {
                           required: "Projeto é obrigatório",
                        })}
                        color={errors.proj ? "failure" : "gray"}
                     >
                        <option value="kc-390">KC-390</option>
                     </Select>
                     {errors.proj && (
                        <p className="text-sm text-red-600">
                           {errors.proj.message}
                        </p>
                     )}
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="data_op" className="text-sm font-semibold">
                        Data Operacional
                        {currentOper !== "al" && (
                           <span className="text-red-500"> *</span>
                        )}
                     </Label>
                     <TextInput
                        id="data_op"
                        type="date"
                        {...register("data_op", {
                           validate: (value, formValues) => {
                              const trimmedValue = value?.trim();
                              if (formValues.oper !== "al" && !trimmedValue) {
                                 return "Data operacional é obrigatória";
                              }
                              return true;
                           },
                        })}
                        color={errors.data_op ? "failure" : "gray"}
                     />
                     {errors.data_op ? (
                        <p className="text-sm text-red-600">
                           {errors.data_op.message}
                        </p>
                     ) : currentOper === "al" ? (
                        <p className="text-xs text-gray-500">
                           Opcional para alunos
                        </p>
                     ) : (
                        <p className="text-xs text-gray-500">
                           Obrigatório para operacionais
                        </p>
                     )}
                  </div>
               </div>

               {/* Botões de Ação */}
               <div className="flex justify-center gap-3 border-t border-slate-200 pt-2">
                  <Button color="gray" onClick={onClose} disabled={submitting}>
                     Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting} color="red">
                     {submitting ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Adicionando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <FaPlus className="size-4" />
                           <span>Adicionar Função</span>
                        </div>
                     )}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
