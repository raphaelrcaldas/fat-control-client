import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
   Button,
   Checkbox,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { FaEdit } from "react-icons/fa";
import { updateTrip } from "services/routes/trips";
import { useToast } from "../../../context/toast";

export function TripDetail({ trip, update }) {
   const [show, setShow] = useState(false);
   const { register, handleSubmit, reset, setValue } = useForm({
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
   const handleClose = useCallback(() => setShow(false), []);

   const { push } = useToast();

   const [submitting, setSubmitting] = useState(false);

   const onSubmit = useCallback(
      (data) => {
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
            className='text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm p-2.5'
            onClick={handleShow}
         >
            <FaEdit className='size-5' />
         </button>
         <Modal show={show} onClose={handleClose} size='md' popup>
            <ModalHeader>Editar Tripulante</ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit(onSubmit)}>
                  <h3 className='text-center uppercase mb-2'>
                     {`${trip.user.p_g} ${trip.user.nome_guerra}`}
                  </h3>
                  <div className='flex flex-row justify-evenly'>
                     <div className='grid mb-4 justify-items-center'>
                        <Label htmlFor='trig'>Trigrama</Label>
                        <TextInput
                           className='w-16 mt-2'
                           id='trig'
                           {...register("trig")}
                        />
                     </div>
                     <div className='mb-4 gap-2 flex flex-col items-center justify-center'>
                        <Label htmlFor='active'>Ativo</Label>
                        <Checkbox
                           className='size-6'
                           color='blue'
                           id='active'
                           {...register("active")}
                        />
                     </div>
                  </div>

                  <div className='shadow-md'>
                     <Table className='text-center uppercase' hoverable>
                        <TableHead>
                           <TableHeadCell>Função</TableHeadCell>
                           <TableHeadCell>Oper</TableHeadCell>
                           <TableHeadCell>Data Op</TableHeadCell>
                        </TableHead>
                        <TableBody>
                           {trip.funcs.map((f) => (
                              <TableRow key={f.id}>
                                 <TableCell>{f.func}</TableCell>
                                 <TableCell>{f.oper}</TableCell>
                                 <TableCell>
                                    {f.data_op ? f.data_op : "NIL"}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>

                  <div className='flex mt-6 justify-center'>
                     <Button type='submit' disabled={submitting} color='blue'>
                        {submitting ? (
                           <div className='flex items-center gap-2'>
                              <Spinner size='sm' />
                              <span>Salvando...</span>
                           </div>
                        ) : (
                           "Salvar"
                        )}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>
      </div>
   );
}
