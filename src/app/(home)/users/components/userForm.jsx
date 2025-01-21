"use client";
import { useEffect, useState } from "react";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { addUser, updateUser, getUserById } from "@/services/routes/users";
import { useForm } from "react-hook-form";
import {
   validateNoNumber,
   onlyText,
   validateOnlyNumber,
   sanitizeText,
} from "@/utils/textFormat";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiMail } from "react-icons/hi";

export function UserRegister({ user_id, updateUsers, readOnly }) {
   const [show, setShow] = useState(false);
   const { register, handleSubmit, reset, setValue } = useForm({
      defaultValues: {
         p_g: "",
         unidade: "",
         ult_promo: null,
         nasc: null,
      },
   });

   // FAZER A REQ SOMENTE QUANDO ABRIR USER MODAL
   useEffect(() => {
      if (show && user_id) {
         getUserById(user_id)
            .then((res) => res.json())
            .then((data) => {
               reset(data);
               setValue("esp", data.esp.toUpperCase());
               setValue("nome_completo", data.nome_completo.toUpperCase());
               setValue("nome_guerra", data.nome_guerra.toUpperCase());
            });
      }
   }, [show]);

   async function onAddUser(data) {
      let response;
      if (user_id) {
         response = await updateUser(user_id, data);
      } else {
         response = await addUser(data);
      }

      const dataRes = await response.json();
      alert(dataRes.detail);

      if (response.ok) {
         reset();
         setShow(false);
         updateUsers();
      }
   }

   function onClose() {
      reset();
      setShow(false);
   }

   return (
      <>
         <Button
            color={user_id ? "gray" : "blue"}
            onClick={() => setShow(true)}
         >
            {user_id ? (
               <IoMdInformationCircleOutline className='h-6 w-6' />
            ) : (
               "Adicionar Usuário"
            )}
         </Button>

         {show && (
            <Modal show={show} size='lg' onClose={onClose} popup>
               <Modal.Header />
               <Modal.Body>
                  <form onSubmit={handleSubmit(onAddUser)}>
                     <h3 className='mb-7 text-xl text-center font-semibold'>
                        {user_id ? "Info User" : "Adicionar Usuário"}
                     </h3>
                     <div className='space-y-2 text-center text-base'>
                        <div className='flex justify-between'>
                           <div className='px-2'>
                              <Label className='mb-2 block' value='P/G' />
                              <Select
                                 defaultValue=''
                                 {...register("p_g", { required: true })}
                                 disabled={readOnly ? true : false}
                              >
                                 <option value='' disabled></option>
                                 <option value='so'>SO</option>
                                 <option value='1s'>1S</option>
                                 <option value='2s'>2S</option>
                                 <option value='3s'>3S</option>
                              </Select>
                           </div>
                           <div className='px-2 w-24'>
                              <Label
                                 className='mb-2 block'
                                 value='Especialidade'
                              />
                              <TextInput
                                 {...register("esp", {
                                    setValueAs: (t) => sanitizeText(t),
                                 })}
                                 autoComplete='off'
                                 maxLength={6}
                                 onKeyPress={(event) => onlyText(event)}
                                 disabled={readOnly ? true : false}
                              />
                           </div>
                           <div className='px-2 w-52'>
                              <Label
                                 className='mb-2 block'
                                 value='Nome de Guerra'
                              />
                              <TextInput
                                 {...register("nome_guerra", {
                                    required: true,
                                    setValueAs: (t) => sanitizeText(t),
                                 })}
                                 disabled={readOnly ? true : false}
                                 autoComplete='off'
                                 onKeyPress={(event) => validateNoNumber(event)}
                              />
                           </div>
                        </div>

                        <div className='flex justify-between'>
                           <div className='px-2 w-full'>
                              <Label
                                 className='mb-2 block'
                                 value='Nome completo'
                              />
                              <TextInput
                                 {...register("nome_completo", {
                                    required: true,
                                    setValueAs: (t) => sanitizeText(t),
                                 })}
                                 disabled={readOnly ? true : false}
                                 autoComplete='off'
                                 onKeyPress={(event) => validateNoNumber(event)}
                              />
                           </div>
                           <div className='px-2 w-48'>
                              <Label className='mb-2 block' value='Unidade' />
                              <Select
                                 defaultValue=''
                                 {...register("unidade", { required: true })}
                                 disabled={readOnly ? true : false}
                              >
                                 <option value='' disabled></option>
                                 <option value='11gt'>1º/1º GT</option>
                                 <option value='12gt'>1º/2º GT</option>
                                 <option value='22gt'>2º/2º GT</option>
                                 <option value='eta3'>3º ETA</option>
                                 <option value='bagl'>BAGL</option>
                                 <option value='glog'>GLOG</option>
                                 <option value='gsd_gl'>GSD-GL</option>
                                 <option value='pama_gl'>PAMA-GL</option>
                              </Select>
                           </div>
                        </div>

                        <div className='flex justify-between'>
                           <div className='px-2'>
                              <Label className='mb-2 block'>SARAM</Label>
                              <TextInput
                                 {...register("saram", {
                                    required: true,
                                    setValueAs: (t) => parseInt(t),
                                 })}
                                 disabled={readOnly ? true : false}
                                 autoComplete='off'
                                 onKeyPress={(event) =>
                                    validateOnlyNumber(event)
                                 }
                                 maxLength={7}
                                 minLength={7}
                              />
                           </div>
                           <div className='px-2'>
                              <Label className='mb-2 block'>ID FAB</Label>
                              <TextInput
                                 {...register("id_fab", {
                                    required: true,
                                    setValueAs: (t) => parseInt(t),
                                 })}
                                 disabled={readOnly ? true : false}
                                 autoComplete='off'
                                 onKeyPress={(event) =>
                                    validateOnlyNumber(event)
                                 }
                                 minLength={6}
                              />
                           </div>
                           <div className='px-2'>
                              <Label className='mb-2 block'>CPF</Label>
                              <TextInput
                                 {...register("cpf", { required: true })}
                                 disabled={readOnly ? true : false}
                                 autoComplete='off'
                                 onKeyPress={(event) =>
                                    validateOnlyNumber(event)
                                 }
                                 minLength={11}
                                 maxLength={11}
                              />
                           </div>
                        </div>

                        <div className='px-2'>
                           <Label className='mb-2 block' value='Zimbra' />
                           <TextInput
                              {...register("email_fab")}
                              disabled={readOnly ? true : false}
                              type='email'
                              autoComplete='off'
                              icon={HiMail}
                           />
                        </div>

                        <div className='px-2'>
                           <Label
                              className='mb-2 block'
                              value='Email particular'
                           />
                           <TextInput
                              {...register("email_pess")}
                              disabled={readOnly ? true : false}
                              type='email'
                              autoComplete='off'
                              icon={HiMail}
                           />
                        </div>

                        <div className='flex'>
                           <div className='px-2 w-1/2'>
                              <Label
                                 className='mb-2 block'
                                 value='Data de Nascimento'
                              />
                              <TextInput
                                 {...register("nasc")}
                                 disabled={readOnly ? true : false}
                                 defaultValue={null}
                                 className='text-sm text-gray-900'
                                 type='date'
                                 autoComplete='off'
                              />
                           </div>

                           <div className='px-2 w-1/2'>
                              <Label
                                 className='mb-2 block'
                                 value='Última Promoção'
                              />
                              <TextInput
                                 {...register("ult_promo")}
                                 disabled={readOnly ? true : false}
                                 defaultValue={null}
                                 className='text-sm text-gray-900'
                                 type='date'
                                 autoComplete='off'
                              />
                           </div>
                        </div>
                     </div>
                     <div className='grid justify-center mt-6'>
                        {readOnly ? "" : <Button type='submit'>Salvar</Button>}
                     </div>
                  </form>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
