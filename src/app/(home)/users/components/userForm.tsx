"use client";
import { useEffect, useState } from "react";
import { Button, Label, Modal, TextInput, Spinner } from "flowbite-react";
import { getUserById, updateUser, addUser } from "services/routes/users";
import { useForm } from "react-hook-form";
import { cpf } from "cpf-cnpj-validator";
import clsx from "clsx";
import { sanitizeText } from "../../../../../utils/textFormat";
import { HiMail } from "react-icons/hi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface DefaultValues {
   p_g: string;
   unidade: string;
   esp: string;
   nome_completo: string;
   nome_guerra: string;
   saram: number | null;
   id_fab: number | null;
   cpf: string;
   email_fab: string;
   email_pess: string;
   ant_rel: number | null;
   ult_promo: string | null;
   nasc: string | null;
}

const values: DefaultValues = {
   p_g: "",
   unidade: "",
   ult_promo: null,
   ant_rel: null,
   nasc: null,
   esp: "",
   nome_completo: "",
   nome_guerra: "",
   saram: null,
   id_fab: null,
   cpf: "",
   email_fab: "",
   email_pess: "",
};

const createUserFormSchema = z.object({
   p_g: z.string().nonempty("Obrigatório").length(2),
   esp: z.string().transform(sanitizeText),
   nome_guerra: z.string().nonempty("Obrigatório").transform(sanitizeText),
   nome_completo: z.string().transform(sanitizeText),
   unidade: z.string().nonempty("Obrigatório"),
   saram: z.coerce.number().gt(1000000).lt(9999999),
   id_fab: z.nullable(z.coerce.number()),
   cpf: z.union([
      z.literal(""),
      z
         .string()
         .refine((userCPF) => cpf.isValid(userCPF), "Digite um CPF válido"),
   ]),
   email_fab: z.union([
      z.literal(""),
      z.string().email().endsWith("fab.mil.br"),
   ]),
   email_pess: z.union([z.literal(""), z.string().email()]),
   nasc: z.nullable(z.string()),
   ult_promo: z.nullable(z.string()),
   ant_rel: z.nullable(z.coerce.number().gt(0)),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function UserRegister({ userId, updateUsers, show, setShow }) {
   const [loadingUser, setLoadingUser] = useState(false);
   const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors },
   } = useForm<CreateUserFormData>({
      defaultValues: values,
      resolver: zodResolver(createUserFormSchema),
   });

   useEffect(() => {
      if (show && userId) {
         setLoadingUser(true);
         getUserById(userId).then((data) => {
            reset(data);
            setValue("esp", data.esp.toUpperCase());
            setValue("nome_completo", data.nome_completo.toUpperCase());
            setValue("nome_guerra", data.nome_guerra.toUpperCase());
            setLoadingUser(false);
         });
      }
   }, [show, userId, reset, setValue]);

   async function onAddUser(data: CreateUserFormData) {
      let response;
      if (userId) {
         response = await updateUser(userId, data);
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
      reset(values);
      setShow(false);
   }

   return (
      <>
         {show && (
            <Modal show={show} size='xl' onClose={onClose} popup>
               <Modal.Header />
               <Modal.Body>
                  <form onSubmit={handleSubmit(onAddUser)}>
                     {loadingUser ? (
                        <div className='flex justify-center items-center h-40'>
                           <Spinner size='xl' />
                        </div>
                     ) : (
                        <>
                           <h3 className='mb-7 text-xl text-center font-semibold'>
                              Usuário
                           </h3>
                           <div className='space-y-2 text-center text-base'>
                              <div className='flex justify-between'>
                                 <div className='px-2 w-24'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       P/G
                                    </label>
                                    <select
                                       className={clsx(
                                          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5",
                                          {
                                             "focus:ring-red-500 focus:border-red-500":
                                                errors.p_g,
                                          }
                                       )}
                                       defaultValue=''
                                       {...register("p_g")}
                                    >
                                       <option value='' disabled></option>
                                       <option value='tb'>TB</option>
                                       <option value='mb'>MB</option>
                                       <option value='br'>BR</option>
                                       <option value='cl'>CL</option>
                                       <option value='tc'>TC</option>
                                       <option value='mj'>MJ</option>
                                       <option value='cp'>CP</option>
                                       <option value='1t'>1T</option>
                                       <option value='2t'>2T</option>
                                       <option value='as'>AS</option>
                                       <option value='so'>SO</option>
                                       <option value='1s'>1S</option>
                                       <option value='2s'>2S</option>
                                       <option value='3s'>3S</option>
                                       <option value='cb'>CB</option>
                                       <option value='s1'>S1</option>
                                       <option value='s2'>S2</option>
                                    </select>
                                    {errors.p_g && (
                                       <span className='text-xs text-red-600'>
                                          {errors.p_g.message}
                                       </span>
                                    )}
                                 </div>
                                 <div className='px-2 w-32'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       Especialidade
                                    </label>
                                    <input
                                       {...register("esp")}
                                       autoComplete='off'
                                       maxLength={6}
                                       className='bg-gray-50 border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                    />
                                 </div>
                                 <div className='px-2 w-52'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       Nome de Guerra
                                    </label>
                                    <input
                                       {...register("nome_guerra")}
                                       autoComplete='off'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                       className={clsx(
                                          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5",
                                          {
                                             "focus:ring-red-500 focus:border-red-500":
                                                errors.nome_guerra,
                                          }
                                       )}
                                    />
                                    {errors.nome_guerra && (
                                       <span className='text-xs text-red-600'>
                                          {typeof errors.nome_guerra
                                             ?.message === "string" &&
                                             errors.nome_guerra.message}
                                       </span>
                                    )}
                                 </div>
                              </div>

                              <div className='flex justify-between'>
                                 <div className='px-2 w-full'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       Nome Completo
                                    </label>
                                    <input
                                       {...register("nome_completo")}
                                       autoComplete='off'
                                       className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                    />
                                 </div>
                                 <div className='px-2 w-48'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       Unidade
                                    </label>
                                    <select
                                       defaultValue=''
                                       {...register("unidade")}
                                       className={clsx(
                                          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5",
                                          {
                                             "focus:ring-red-500 focus:border-red-500":
                                                errors.unidade,
                                          }
                                       )}
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
                                       <option value='ctla'>CTLA</option>
                                       <option value='gapgl'>GAP-GL</option>
                                    </select>
                                    {errors.unidade && (
                                       <span className='text-xs text-red-600'>
                                          {errors.unidade.message}
                                       </span>
                                    )}
                                 </div>
                              </div>

                              <div className='flex justify-between'>
                                 <div className='px-2 w-32'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       SARAM
                                    </label>
                                    <input
                                       {...register("saram")}
                                       autoComplete='off'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/[0-9]/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                       className={clsx(
                                          "bg-gray-50 border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5",
                                          {
                                             "focus:ring-red-500 focus:border-red-500":
                                                errors.saram,
                                          }
                                       )}
                                       maxLength={7}
                                       minLength={7}
                                    />
                                    {errors.saram && (
                                       <span className='text-xs text-red-600'>
                                          Insira um SARAM válido
                                       </span>
                                    )}
                                 </div>
                                 <div className='px-2 w-32'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       ID FAB
                                    </label>
                                    <input
                                       {...register("id_fab")}
                                       autoComplete='off'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/[0-9]/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                       className='bg-gray-50 border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                       minLength={6}
                                    />
                                 </div>
                                 <div className='px-2'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                       CPF
                                    </label>
                                    <input
                                       {...register("cpf")}
                                       autoComplete='off'
                                       onKeyDown={(e) => {
                                          if (
                                             !e.key.match(/[0-9]/) &&
                                             e.key !== "Backspace" &&
                                             e.key !== "Delete" &&
                                             e.key !== "Tab"
                                          ) {
                                             e.preventDefault();
                                          }
                                       }}
                                       className={clsx(
                                          "bg-gray-50 border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5",
                                          {
                                             "focus:ring-red-500 focus:border-red-500":
                                                errors.cpf,
                                          }
                                       )}
                                       minLength={11}
                                       maxLength={11}
                                    />
                                    {errors.cpf && (
                                       <span className='text-xs text-red-600'>
                                          {errors.cpf.message}
                                       </span>
                                    )}
                                 </div>
                              </div>

                              <div className='px-2'>
                                 <label className='block mb-2 text-sm font-medium text-gray-900'>
                                    Zimbra
                                 </label>
                                 <TextInput
                                    {...register("email_fab")}
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
                                    type='email'
                                    autoComplete='off'
                                    icon={HiMail}
                                 />
                              </div>

                              <div className='grid grid-cols-3'>
                                 <div className='px-2'>
                                    <Label
                                       className='mb-2 block'
                                       value='Data de Nascimento'
                                    />
                                    <TextInput
                                       {...register("nasc")}
                                       defaultValue={null}
                                       className='text-sm text-gray-900'
                                       type='date'
                                       autoComplete='off'
                                    />
                                    {errors.nasc && (
                                       <span className='text-xs text-red-600'>
                                          {errors.nasc.message}
                                       </span>
                                    )}
                                 </div>
                                 <div className='px-2'>
                                    <Label
                                       className='mb-2 block'
                                       value='Última Promoção'
                                    />
                                    <TextInput
                                       {...register("ult_promo")}
                                       defaultValue={null}
                                       className='text-sm text-gray-900'
                                       type='date'
                                       autoComplete='off'
                                    />
                                 </div>
                                 <div className='px-2'>
                                    <Label
                                       className='mb-2 block'
                                       value='Antiguidade Relativa'
                                    />
                                    <TextInput
                                       {...register("ant_rel")}
                                       defaultValue={null}
                                       className='text-sm text-gray-900'
                                       type='number'
                                       min={1}
                                       autoComplete='off'
                                    />
                                 </div>
                              </div>
                           </div>
                           <div className='grid justify-center mt-6'>
                              <Button type='submit'>Salvar</Button>
                           </div>
                        </>
                     )}
                  </form>
               </Modal.Body>
            </Modal>
         )}
      </>
   );
}
