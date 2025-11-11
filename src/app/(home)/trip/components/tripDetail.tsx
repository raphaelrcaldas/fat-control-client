import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
   Button,
   Checkbox,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
   Badge,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { FaEdit, FaSave } from "react-icons/fa";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { updateTrip } from "services/routes/trips";
import { useToast } from "../../../context/toast";
import clsx from "clsx";

type TripFormFields = {
   trig: string;
   active: boolean;
};

export function TripDetail({ trip, update }) {
   const [show, setShow] = useState(false);
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = useForm<TripFormFields>({
      defaultValues: {
         trig: trip.trig,
         active: trip.active,
      },
   });

   useEffect(() => {
      reset({
         trig: trip.trig.toUpperCase(),
         active: trip.active,
      });
   }, [trip, reset]);

   const handleShow = useCallback(() => setShow(true), []);
   const handleClose = useCallback(() => {
      setShow(false);
      reset();
   }, [reset]);

   const { push } = useToast();

   const [submitting, setSubmitting] = useState(false);

   const onSubmit = useCallback(
      (data: TripFormFields) => {
         data.trig = data.trig.toLowerCase();
         setSubmitting(true);

         updateTrip(trip.id, data)
            .then(() => {
               update();
               handleClose();
               push({
                  type: "success",
                  message: "Tripulante atualizado com sucesso.",
               });
            })
            .catch((err) => {
               console.error(err);
               push({
                  type: "error",
                  message: "Erro ao atualizar tripulante.",
               });
            })
            .finally(() => setSubmitting(false));
      },
      [trip.id, update, handleClose, push]
   );

   return (
      <div>
         <button
            className='text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100 font-medium rounded-lg text-sm p-2.5 transition-all'
            onClick={handleShow}
            title='Editar tripulante'
         >
            <FaEdit className='size-5' />
         </button>
         <Modal show={show} onClose={handleClose} size='lg'>
            <ModalHeader>Editar Tripulante</ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                  {/* Informações do Usuário */}
                  <div className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                     <div className='flex items-center justify-between'>
                        <div>
                           <h3 className='text-lg font-bold text-gray-800 uppercase'>
                              {`${trip.user.posto.short} ${trip.user.esp} ${trip.user.nome_guerra}`}
                           </h3>
                           <p className='text-sm text-gray-600 mt-1 capitalize'>
                              {trip.user.nome_completo}
                           </p>
                        </div>
                        <Badge
                           color={trip.active ? "success" : "failure"}
                           size='sm'
                        >
                           {trip.active ? (
                              <div className='flex items-center gap-1'>
                                 <HiCheckCircle className='size-4' />
                                 <span>Ativo</span>
                              </div>
                           ) : (
                              <div className='flex items-center gap-1'>
                                 <HiXCircle className='size-4' />
                                 <span>Inativo</span>
                              </div>
                           )}
                        </Badge>
                     </div>
                  </div>

                  {/* Formulário de Edição */}
                  <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                     <div className='flex flex-col gap-2'>
                        <Label htmlFor='trig' className='text-sm font-semibold'>
                           Trigrama <span className='text-red-500'>*</span>
                        </Label>
                        <TextInput
                           id='trig'
                           {...register("trig", {
                              required: "Trigrama é obrigatório",
                              minLength: {
                                 value: 3,
                                 message: "Trigrama deve ter 3 letras",
                              },
                              maxLength: {
                                 value: 3,
                                 message: "Trigrama deve ter 3 letras",
                              },
                           })}
                           maxLength={3}
                           placeholder='abc'
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
                           <p className='text-sm text-red-600 mt-1'>
                              {errors.trig.message}
                           </p>
                        )}
                     </div>
                     <div className='flex flex-col gap-2'>
                        <Label
                           htmlFor='active'
                           className='text-sm font-semibold'
                        >
                           Status
                        </Label>
                        <div className='flex items-center gap-2 h-[42px]'>
                           <Checkbox
                              id='active'
                              className='size-5'
                              color='blue'
                              {...register("active")}
                           />
                           <Label htmlFor='active' className='cursor-pointer'>
                              Tripulante ativo
                           </Label>
                        </div>
                     </div>
                  </div>

                  {/* Tabela de Funções */}
                  <div>
                     <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                        Funções
                     </h4>
                     {trip.funcs.length > 0 ? (
                        <div className='border border-gray-200 rounded-lg overflow-hidden'>
                           <Table className='text-center uppercase'>
                              <TableHead>
                                 <TableHeadCell>Função</TableHeadCell>
                                 <TableHeadCell>Oper</TableHeadCell>
                                 <TableHeadCell>Data Op</TableHeadCell>
                              </TableHead>
                              <TableBody>
                                 {trip.funcs.map((f) => (
                                    <TableRow
                                       key={f.id}
                                       className='hover:bg-gray-50'
                                    >
                                       <TableCell className='font-semibold'>
                                          {f.func}
                                       </TableCell>
                                       <TableCell>
                                          <span
                                             className={clsx(
                                                "px-2 py-1 rounded font-medium",
                                                {
                                                   "text-emerald-600 bg-emerald-50":
                                                      f.oper === "al",
                                                   "text-yellow-600 bg-yellow-50":
                                                      f.oper === "op" ||
                                                      f.oper === "po" ||
                                                      f.oper === "pb",
                                                   "text-red-600 bg-red-50":
                                                      f.oper === "in",
                                                }
                                             )}
                                          >
                                             {f.oper}
                                          </span>
                                       </TableCell>
                                       <TableCell className='text-gray-600'>
                                          {f.data_op ? f.data_op : "NIL"}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     ) : (
                        <div className='p-8 text-center bg-gray-50 rounded-lg border border-gray-200'>
                           <p className='text-gray-500 text-sm'>
                              Nenhuma função cadastrada
                           </p>
                        </div>
                     )}
                  </div>

                  {/* Botões de Ação */}
                  <div className='flex gap-3 justify-end pt-2 border-t border-gray-200'>
                     <Button
                        color='gray'
                        onClick={handleClose}
                        disabled={submitting}
                     >
                        Cancelar
                     </Button>
                     <Button
                        type='submit'
                        disabled={submitting || !isDirty}
                        color='blue'
                     >
                        {submitting ? (
                           <div className='flex items-center gap-2'>
                              <Spinner size='sm' color='white' />
                              <span>Salvando...</span>
                           </div>
                        ) : (
                           <div className='flex items-center gap-2'>
                              <FaSave className='size-4' />
                              <span>Salvar Alterações</span>
                           </div>
                        )}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>
      </div>
   );
}
