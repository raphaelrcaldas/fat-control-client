"use client";
import { useEffect, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
   Select,
   Checkbox,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { getUserById, updateUser, addUser } from "services/routes/users";
import { useToast } from "../../../context/toast";
import { useForm, Resolver } from "react-hook-form";
import clsx from "clsx";
import { HiMail } from "react-icons/hi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   createUserFormSchema,
   defaultUserValues,
   CreateUserFormData,
} from "../schemas/userFormSchema";

export function UserRegister({ userId, updateUsers }) {
   const [loadingUser, setLoadingUser] = useState(false);
   const [initialValues, setInitialValues] =
      useState<CreateUserFormData | null>(null);
   const { push } = useToast();
   const {
      register,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors },
   } = useForm<CreateUserFormData>({
      defaultValues: defaultUserValues,
      resolver: zodResolver(
         createUserFormSchema
      ) as Resolver<CreateUserFormData>,
   });

   useEffect(() => {
      const fetchUser = async () => {
         if (userId) {
            setLoadingUser(true);
            try {
               const data = await getUserById(userId);
               // normalizar para a forma do form
               const init: CreateUserFormData = {
                  p_g: data.p_g || "",
                  unidade: data.unidade || "",
                  esp: (data.esp || "").toUpperCase(),
                  nome_guerra: (data.nome_guerra || "").toUpperCase(),
                  nome_completo: (data.nome_completo || "").toUpperCase(),
                  saram: data.saram ?? null,
                  id_fab: data.id_fab ?? null,
                  cpf: data.cpf || "",
                  email_fab: data.email_fab || "",
                  email_pess: data.email_pess || "",
                  nasc: data.nasc ?? null,
                  ult_promo: data.ult_promo ?? null,
                  ant_rel: data.ant_rel ?? null,
                  active: data.active ?? true,
               };

               reset(init);
               setInitialValues(init);
            } catch (err: any) {
               console.error("Erro ao buscar usuário:", err);
            } finally {
               setLoadingUser(false);
            }
         } else {
            reset(defaultUserValues);
            setInitialValues(null);
         }
      };

      fetchUser();
   }, [userId, reset, setValue]);

   const currentValues = watch();
   const baseValues = initialValues ?? defaultUserValues;
   const diffPreview = getChangedFields(
      baseValues as any,
      currentValues as any
   );
   const hasChanges = Object.keys(diffPreview).length > 0;

   async function onAddUser(data: CreateUserFormData) {
      try {
         let response;
         if (userId) {
            // enviar somente campos modificados
            if (!initialValues) {
               // fallback: enviar tudo se não temos referência
               response = await updateUser(userId, data);
            } else {
               const diff = getChangedFields(
                  initialValues as CreateUserFormData,
                  data
               );

               if (Object.keys(diff).length === 0) {
                  push({
                     message: "Nenhuma alteração detectada",
                     type: "info",
                  });
                  return;
               }

               response = await updateUser(userId, diff);
            }
         } else {
            response = await addUser(data);
         }
         const dataRes = await response.json();
         push({
            message:
               dataRes.detail || (response.ok ? "Operação realizada" : "Erro"),
            type: response.ok ? "success" : "error",
         });
         if (response.ok) {
            reset();
            updateUsers();
         }
      } catch (err: any) {
         console.error(err);
         push({
            message: err?.message || "Erro ao salvar usuário",
            type: "error",
         });
      }
   }

   return (
      <form onSubmit={handleSubmit(onAddUser)} className='h-full flex flex-col'>
         {loadingUser ? (
            <div className='flex justify-center items-center h-40'>
               <Spinner size='xl' />
            </div>
         ) : (
            <>
               <div className='flex-1'>
                  <UserFormFields register={register} errors={errors} />
               </div>
               <div className='flex justify-center gap-3 pt-4 mt-4 border-t border-gray-200 sticky bottom-0 bg-white'>
                  <Button
                     color='red'
                     type='submit'
                     disabled={!hasChanges || loadingUser}
                     size='lg'
                  >
                     {!userId ? "Adicionar" : "Salvar Alterações"}
                  </Button>
               </div>
            </>
         )}
      </form>
   );
}

function UserFormFields({ register, errors }: any) {
   return (
      <div className='space-y-4'>
         {/* Seção: Identificação */}
         <div>
            <div className='grid grid-cols-12 gap-3'>
               <div className='col-span-2'>
                  <Label>P/G</Label>
                  <Select
                     className={clsx("", {
                        "focus:ring-red-500 focus:border-red-500": errors.p_g,
                     })}
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
                  </Select>
                  {errors.p_g && (
                     <span className='text-xs text-red-600'>
                        {errors.p_g.message}
                     </span>
                  )}
               </div>
               <div className='col-span-2'>
                  <Label>Especialidade</Label>
                  <TextInput
                     {...register("esp")}
                     autoComplete='off'
                     maxLength={6}
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
               <div className='col-span-3'>
                  <Label>Nome de Guerra</Label>
                  <TextInput
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
                     className={clsx({
                        "focus:ring-red-500 focus:border-red-500":
                           errors.nome_guerra,
                     })}
                  />
                  {errors.nome_guerra && (
                     <span className='text-xs text-red-600'>
                        {typeof errors.nome_guerra?.message === "string" &&
                           errors.nome_guerra.message}
                     </span>
                  )}
               </div>
               <div className='col-span-5'>
                  <Label>Nome Completo</Label>
                  <TextInput
                     {...register("nome_completo")}
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
                  />
               </div>
            </div>
         </div>
         {/* Seção: Documentação */}
         <div>
            <div className='grid grid-cols-12 gap-3'>
               <div className='col-span-3'>
                  <Label>Unidade</Label>
                  <Select
                     defaultValue=''
                     {...register("unidade")}
                     className={clsx("", {
                        "focus:ring-red-500 focus:border-red-500":
                           errors.unidade,
                     })}
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
                  </Select>
                  {errors.unidade && (
                     <span className='text-xs text-red-600'>
                        {errors.unidade.message}
                     </span>
                  )}
               </div>
               <div className='col-span-3'>
                  <Label>SARAM</Label>
                  <TextInput
                     {...register("saram")}
                     autoComplete='off'
                     onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                           return;
                        }
                        if (
                           !e.key.match(/[0-9]/) &&
                           e.key !== "Backspace" &&
                           e.key !== "Delete" &&
                           e.key !== "Tab"
                        ) {
                           e.preventDefault();
                        }
                     }}
                     className={clsx("", {
                        "focus:ring-red-500 focus:border-red-500": errors.saram,
                     })}
                     maxLength={7}
                     minLength={7}
                  />
                  {errors.saram && (
                     <span className='text-xs text-red-600'>
                        Insira um SARAM válido
                     </span>
                  )}
               </div>
               <div className='col-span-3'>
                  <Label>ID FAB</Label>
                  <TextInput
                     {...register("id_fab")}
                     autoComplete='off'
                     onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                           return;
                        }
                        if (
                           !e.key.match(/[0-9]/) &&
                           e.key !== "Backspace" &&
                           e.key !== "Delete" &&
                           e.key !== "Tab"
                        ) {
                           e.preventDefault();
                        }
                     }}
                     minLength={6}
                  />
               </div>
               <div className='col-span-3'>
                  <Label>CPF</Label>
                  <TextInput
                     {...register("cpf")}
                     autoComplete='off'
                     onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                           return;
                        }
                        if (
                           !e.key.match(/[0-9]/) &&
                           e.key !== "Backspace" &&
                           e.key !== "Delete" &&
                           e.key !== "Tab"
                        ) {
                           e.preventDefault();
                        }
                     }}
                     className={clsx("", {
                        "focus:ring-red-500 focus:border-red-500": errors.cpf,
                     })}
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
         </div>

         {/* Seção: Contato e Datas */}
         <div>
            <div className='grid grid-cols-12 gap-3'>
               <div className='col-span-4'>
                  <Label>Email Zimbra</Label>
                  <TextInput
                     {...register("email_fab")}
                     type='email'
                     autoComplete='off'
                     icon={HiMail}
                  />
               </div>
               <div className='col-span-4'>
                  <Label>Email Particular</Label>
                  <TextInput
                     {...register("email_pess")}
                     type='email'
                     autoComplete='off'
                     icon={HiMail}
                  />
               </div>
               <div className='col-span-4'>
                  <Label>Data de Nascimento</Label>
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
            </div>
         </div>

         {/* Seção: Carreira */}
         <div>
            <div className='grid grid-cols-12 gap-3'>
               <div className='col-span-6'>
                  <Label>Última Promoção</Label>
                  <TextInput
                     {...register("ult_promo")}
                     defaultValue={null}
                     className='text-sm text-gray-900'
                     type='date'
                     autoComplete='off'
                  />
               </div>
               <div className='col-span-6'>
                  <Label>Antiguidade Relativa</Label>
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

         {/* Seção: Status */}
         <div>
            <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg'>
               <Checkbox
                  id='active'
                  className='size-5'
                  color='red'
                  {...register("active")}
               />
               <Label htmlFor='active' className='cursor-pointer'>
                  Usuário ativo
               </Label>
            </div>
         </div>
      </div>
   );
}

// Modal de cadastro de novo usuário
export function UserCreateModal({
   show,
   setShow,
   updateUsers,
}: {
   show: boolean;
   setShow: (v: boolean) => void;
   updateUsers: () => void;
}) {
   return (
      <Modal show={show} size='4xl' onClose={() => setShow(false)} popup>
         <ModalHeader>Cadastrar novo usuário</ModalHeader>
         <ModalBody>
            <UserRegister userId={null} updateUsers={updateUsers} />
         </ModalBody>
      </Modal>
   );
}

function getChangedFields<T extends Record<string, any>>(oldObj: T, newObj: T) {
   function isEmpty(val) {
      return val === null || val === undefined || val === "";
   }

   const diff: Partial<T> = {};
   Object.keys(newObj).forEach((k) => {
      const key = k as keyof T;
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      const changed =
         isEmpty(oldVal) !== isEmpty(newVal) ||
         String(oldVal).toLowerCase() !== String(newVal).toLowerCase();

      if (changed) diff[key] = newVal;
   });
   return diff;
}
