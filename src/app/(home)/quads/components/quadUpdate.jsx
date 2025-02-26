import { useEffect, useState } from "react";
import { Modal, Button, TextInput, Textarea } from "flowbite-react";
import { updateQuad, deleteQuad } from "@/services/routes/quads";

export function QuadUpdateModal({
   quad,
   updateQuadsTrip,
   quadsAllUpdate,
   tridId,
}) {
   const [quadValue, setQuadValue] = useState(quad.value);
   const [isOpen, setIsOpen] = useState(false);
   const [obs, setObs] = useState(quad.description);

   const handleSubmit = async (event) => {
      event.preventDefault();
      const quadUpdated = {
         trip_id: tridId,
         id: quad.id,
         value: quadValue,
         description: obs,
      };

      const res = await updateQuad(quadUpdated);

      if (res.ok) {
         setIsOpen(false);
         alert("Quadrinho atualizado com sucesso!");
         quadsAllUpdate();
         updateQuadsTrip();
      } else {
         const detail = await res.json();
         alert(detail.detail);
      }
   };

   const handleDelete = async () => {
      const delQuad = window.confirm(
         "Deseja realmente deletar este quadrinho?"
      );
      if (delQuad) {
         const res = await deleteQuad(quad.id);

         if (res.ok) {
            setIsOpen(false);
            alert("Quadrinho deletado com sucesso!");
            updateQuadsTrip();
            quadsAllUpdate();
         } else {
            alert(res.detail);
         }
      }
   };

   return (
      <>
         <Button pill color="light" onClick={() => setIsOpen(true)}>Editar</Button>

         {isOpen && (
            <Modal show={isOpen} onClose={() => setIsOpen(false)} size='sm'>
               <Modal.Header>Atualizar Quadrinho</Modal.Header>
               <Modal.Body>
                  <form onSubmit={handleSubmit}>
                     <h3 className='text-center font-semibold'>
                        ID: {quad.id}
                     </h3>
                     <h3 className='text-center font-semibold mt-4'>
                        {quad.type}
                     </h3>
                     <div className='grid justify-center mt-6 text-center gap-4'>
                        {quadValue && (
                           <div className='w-60 grid justify-center bg-gray-50 py-4 rounded-lg shadow-md'>
                              <div className='flex gap-4 items-center'>
                                 <div>
                                    <TextInput
                                       value={quadValue}
                                       onChange={(e) =>
                                          setQuadValue(e.target.value)
                                       }
                                       className='text-sm text-gray-900'
                                       type='date'
                                       autoComplete='off'
                                    />
                                 </div>
                              </div>
                           </div>
                        )}

                        {!quadValue && (
                           <div className='w-60 grid justify-center bg-gray-50 py-4 rounded-lg shadow-md'>
                              <h3 className='font-semibold'>LASTRO</h3>
                           </div>
                        )}

                        <div className='mt-6 w-60 rounded-lg shadow-md'>
                           <Textarea
                              value={!obs ? "" : obs}
                              className='text-base'
                              onChange={(e) => setObs(e.target.value)}
                              placeholder='Observações'
                           />
                        </div>

                        <div className='flex justify-center gap-2 mt-6'>
                           {quadValue && (
                              <Button type='submit'>Atualizar</Button>
                           )}
                           <Button onClick={handleDelete} color='failure'>
                              Deletar
                           </Button>
                        </div>
                     </div>
                  </form>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
