import {
   Modal,
   ModalHeader,
   ModalBody,
   Label,
   Select,
   TextInput,
   Button,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { FaPlus } from "react-icons/fa";
import { useFuncForm } from "../../hooks/useFuncForm";
import { isFuncAvailable } from "../../utils/checkFuncAvailability";
import type { Trip } from "../../types/trip.types";

type FuncAddModalProps = {
   show: boolean;
   onClose: () => void;
   trip: Trip;
   onSuccess: () => void;
};

export function FuncAddModal({
   show,
   onClose,
   trip,
   onSuccess,
}: FuncAddModalProps) {
   const { register, handleSubmit, errors, submitting, currentOper } =
      useFuncForm({
         tripId: trip.id!,
         editingFunc: null,
         onSuccess,
         onClose,
      });

   return (
      <Modal show={show} onClose={onClose} size='md'>
         <ModalHeader>Adicionar Função</ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className='space-y-4'>
               {/* Informações do Tripulante */}
               <div className='p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                  <h3 className='text-sm font-bold text-gray-800 uppercase'>
                     {`${trip.user.posto.short} ${trip.user.esp} ${trip.user.nome_guerra}`}
                  </h3>
               </div>

               {/* Campos do Formulário */}
               <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-2'>
                     <Label htmlFor='func' className='text-sm font-semibold'>
                        Função <span className='text-red-500'>*</span>
                     </Label>
                     <Select
                        id='func'
                        {...register("func", {
                           required: "Função é obrigatória",
                        })}
                        color={errors.func ? "failure" : "gray"}
                     >
                        <option value=''>Selecione</option>

                        {isFuncAvailable("pil", trip.funcs || []) && (
                           <option value='pil'>PIL - Piloto</option>
                        )}
                        {isFuncAvailable("mc", trip.funcs || []) && (
                           <option value='mc'>MC - Mecânico</option>
                        )}
                        {isFuncAvailable("lm", trip.funcs || []) && (
                           <option value='lm'>LM - Loadmaster</option>
                        )}
                        {isFuncAvailable("oe", trip.funcs || []) && (
                           <option value='oe'>
                              OE - Operador de Equipamentos
                           </option>
                        )}
                        {isFuncAvailable("os", trip.funcs || []) && (
                           <option value='os'>OS - Observador SAR</option>
                        )}
                        {isFuncAvailable("tf", trip.funcs || []) && (
                           <option value='tf'>TF - Comissário</option>
                        )}
                        {isFuncAvailable("md", trip.funcs || []) && (
                           <option value='md'>MD - Médico</option>
                        )}
                        {isFuncAvailable("ml", trip.funcs || []) && (
                           <option value='ml'>ML - Mestre de Lançamento</option>
                        )}
                     </Select>
                     {errors.func && (
                        <p className='text-sm text-red-600'>
                           {errors.func.message}
                        </p>
                     )}
                  </div>

                  <div className='flex flex-col gap-2'>
                     <Label htmlFor='oper' className='text-sm font-semibold'>
                        Operacionalidade <span className='text-red-500'>*</span>
                     </Label>
                     <Select
                        id='oper'
                        {...register("oper", {
                           required: "Operacionalidade é obrigatório",
                        })}
                        color={errors.oper ? "failure" : "gray"}
                     >
                        <option value=''>Selecione</option>
                        <option value='al'>📚 AL - Aluno</option>
                        <option value='ba'>⭐ BA - Básico</option>
                        <option value='op'>🪖 OP - Operacional</option>
                        <option value='in'>🎓 IN - Instrutor</option>
                     </Select>
                     {errors.oper && (
                        <p className='text-sm text-red-600'>
                           {errors.oper.message}
                        </p>
                     )}
                  </div>

                  <div className='flex flex-col gap-2'>
                     <Label htmlFor='proj' className='text-sm font-semibold'>
                        Projeto <span className='text-red-500'>*</span>
                     </Label>
                     <Select
                        id='proj'
                        disabled
                        {...register("proj", {
                           required: "Projeto é obrigatório",
                        })}
                        color={errors.proj ? "failure" : "gray"}
                     >
                        <option value='kc-390'>KC-390</option>
                     </Select>
                     {errors.proj && (
                        <p className='text-sm text-red-600'>
                           {errors.proj.message}
                        </p>
                     )}
                  </div>

                  <div className='flex flex-col gap-2'>
                     <Label htmlFor='data_op' className='text-sm font-semibold'>
                        Data Operacional
                        {currentOper !== "al" && (
                           <span className='text-red-500'> *</span>
                        )}
                     </Label>
                     <TextInput
                        id='data_op'
                        type='date'
                        {...register("data_op", {
                           validate: (value) => {
                              if (currentOper !== "al" && !value) {
                                 return "Data operacional é obrigatória";
                              }
                              return true;
                           },
                        })}
                        color={errors.data_op ? "failure" : "gray"}
                     />
                     {errors.data_op ? (
                        <p className='text-sm text-red-600'>
                           {errors.data_op.message}
                        </p>
                     ) : currentOper === "al" ? (
                        <p className='text-xs text-gray-500'>
                           Opcional para alunos
                        </p>
                     ) : (
                        <p className='text-xs text-gray-500'>
                           Obrigatório para operacionais
                        </p>
                     )}
                  </div>
               </div>

               {/* Botões de Ação */}
               <div className='flex gap-3 justify-center pt-2 border-t border-gray-200'>
                  <Button color='gray' onClick={onClose} disabled={submitting}>
                     Cancelar
                  </Button>
                  <Button type='submit' disabled={submitting} color='blue'>
                     {submitting ? (
                        <div className='flex items-center gap-2'>
                           <Spinner size='sm' color='white' />
                           <span>Adicionando...</span>
                        </div>
                     ) : (
                        <div className='flex items-center gap-2'>
                           <FaPlus className='size-4' />
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
