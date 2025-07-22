"use client";
import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Label,
   Textarea,
   TextInput,
   Select,
   Checkbox,
} from "flowbite-react";
import { useEffect } from "react";
import {
   Missao,
   createFragMis,
   updateFragMis,
} from "services/routes/cegep/missoes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createFragMisSchema = z.object({
   doc_ref: z.string().nonempty("Obrigatório"),
   desc: z.string().nonempty("Obrigatório"),
   tipo: z.string(
      z.union([z.literal("adm"), z.literal("cap"), z.literal("opr")])
   ),
   indenizavel: z.boolean(),
   obs: z.string(),
});

type CreateFragMisFormData = z.infer<typeof createFragMisSchema>;

const defValues: Missao = {
   doc_ref: "",
   desc: "",
   tipo: "",
   indenizavel: false,
   obs: "",
};

export function FormMission({
   show,
   setShow,
   missao,
   updateMis,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   missao?: Missao;
   updateMis: () => void;
}) {
   const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors },
   } = useForm<CreateFragMisFormData>({
      defaultValues: defValues,
      resolver: zodResolver(createFragMisSchema),
   });

   useEffect(() => {
      if (show && missao) {
         reset(missao);
         setValue("doc_ref", missao.doc_ref.toUpperCase());
         setValue("desc", missao.desc.toUpperCase());
      }
   }, [show]);

   async function handleFrag(data: Missao) {
      let response;
      if (missao) {
         response = await updateFragMis(missao.id, data);
      } else {
         response = await createFragMis(data);
      }
      const dataRes = await response.json();
      alert(dataRes.detail);

      if (response.ok) {
         setShow(false);
         updateMis();
      }
   }

   function onClose() {
      reset(defValues);
      setShow(false);
   }

   return (
      <>
         {show && (
            <Modal show={show} size='md' onClose={onClose}>
               <ModalHeader>
                  {missao ? "Editar" : "Adicionar"} Missão
               </ModalHeader>
               <ModalBody>
                  <form onSubmit={handleSubmit(handleFrag)}>
                     <div>
                        <div>
                           <Label>Ordem Referência</Label>
                           <TextInput {...register("doc_ref")} />
                        </div>
                        <div className='mt-4 flex gap-4 justify-between'>
                           <div className='w-1/2'>
                              <Label>Tipo</Label>
                              <Select required {...register("tipo")}>
                                 <option value='' disabled>
                                    Selecione o tipo
                                 </option>
                                 <option value='tal'>TAL</option>
                                 <option value='opr'>Operacional</option>
                                 <option value='adm'>Administrativo</option>
                              </Select>
                           </div>
                           <div className='flex flex-col w-1/2 gap-2 justify-center items-center'>
                              <Label>Indenizável</Label>
                              <Checkbox
                                 {...register("indenizavel")}
                                 className='size-5'
                              />
                           </div>
                        </div>
                        <div className='mt-4'>
                           <Label>Descrição</Label>
                           <TextInput {...register("desc")} />
                        </div>
                        <div className='mt-4'>
                           <Label>Observação</Label>
                           <Textarea {...register("obs")} />
                        </div>
                     </div>
                     <div className='mt-4 grid justify-items-center'>
                        <Button type='submit'>
                           {missao ? "Salvar" : "Adicionar"}
                        </Button>
                     </div>
                  </form>
               </ModalBody>
            </Modal>
         )}
      </>
   );
}
