"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { getToken } from "@/services/routes/auth";
import { useForm } from "react-hook-form";
import { Modal, Button, Spinner } from "flowbite-react";
import { validateOnlyNumber } from "@/utils/textFormat";
import { changePassword } from "@/services/routes/users";

const handlePasswordChange = async (data, token) => {
   if (data.newPassword === data.confirmPassword) {
      const pwdBody = {
         prev_pwd: "12345678",
         new_pwd: data.newPassword,
      };

      changePassword(pwdBody, token)
         .then((res) => res.json())
         .then((data) => {
            alert(data.detail);
         });
   } else {
      alert("Senhas não conferem");
   }
};

const ChangePasswordModal = ({ show, onClose, onSubmit, token }) => {
   const { register, handleSubmit, reset } = useForm();
   const [isLoading, setIsLoading] = useState(false);

   const handlePasswordChange = async (data) => {
      setIsLoading(true);
      await onSubmit(data, token);
      setIsLoading(false);
      reset();
      onClose();
   };

   return (
      <Modal show={show} onClose={onClose} size='md'>
         <Modal.Header>Alterar Senha</Modal.Header>
         <Modal.Body>
            <form onSubmit={handleSubmit(handlePasswordChange)}>
               <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700'>
                     Nova Senha
                  </label>
                  <input
                     {...register("newPassword", { required: true })}
                     type='password'
                     className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
               </div>
               <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700'>
                     Confirmar Nova Senha
                  </label>
                  <input
                     {...register("confirmPassword", { required: true })}
                     type='password'
                     className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  />
               </div>
               <div className='flex justify-center'>
                  <Button type='submit' disabled={isLoading}>
                     {isLoading ? (
                        <Spinner color='failure' aria-label='Loading spinner' />
                     ) : (
                        "Alterar Senha"
                     )}
                  </Button>
               </div>
            </form>
         </Modal.Body>
      </Modal>
   );
};

const LoginPage = () => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const [tokenValue, setTokenValue] = useState("");
   const [showChangePasswordModal, setShowChangePasswordModal] =
      useState(false);
   const { register, handleSubmit, reset } = useForm({
      defaultValues: {
         password: "",
      },
   });

   const handleLogin = async (data) => {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);

      const response = await getToken(formData);
      const dataR = await response.json();

      if (response.ok) {
         const token = dataR.access_token;
         const [header, payload, sign] = token.split(".");
         const data = await JSON.parse(atob(payload));

         setTokenValue(token);

         if (data.first_login) {
            setShowChangePasswordModal(true);
         } else {
            await setCookie("token", token);
            router.push("/");
         }
      } else {
         alert(dataR.detail);
         reset({ password: "" });
      }
      setIsLoading(false);
   };

   return (
      <div className='flex flex-col md:flex-row h-full md:h-screen bg-gradient-to-r from-gray-100 to-gray-300'>
         {/* Esquerda */}
         <div className='flex items-center justify-center w-full md:w-1/2 p-6 md:p-0 text-center'>
            <div className='flex flex-col gap-6 p-8 bg-white rounded-lg shadow-lg w-full max-w-md'>
               <span className='text-4xl font-bold text-gray-800'>
                  FAT
                  <span className='text-red-500'>CONTROL</span>
               </span>
               <div className='text-gray-500 flex flex-col'>
                  <span className='text-xl font-bold'>
                     1º/1º Grupo de Transporte
                  </span>
                  <span className='text-base font-semibold'>
                     Uma Equipe, um coração.
                  </span>
               </div>
            </div>
         </div>

         {/* Direita */}
         <div className='flex items-center justify-center w-full md:w-1/2 p-6 md:p-0'>
            <div className='p-8 bg-red-500 h-72 rounded-lg shadow-lg w-full max-w-md'>
               <h2 className='text-center text-white uppercase text-lg font-bold'>
                  Login
               </h2>
               <form
                  onSubmit={handleSubmit(handleLogin)}
                  className='flex flex-col items-center justify-center gap-4 mt-6'
               >
                  <input
                     {...register("username", {
                        required: true,
                     })}
                     className='bg-gray-50 w-2/3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block max-w-xs p-2'
                     autoComplete='off'
                     onKeyPress={(event) => validateOnlyNumber(event)}
                     maxLength={7}
                     minLength={7}
                     placeholder='SARAM'
                  />
                  <input
                     {...register("password", {
                        required: true,
                     })}
                     className='bg-gray-50 w-2/3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block max-w-xs p-2'
                     autoComplete='off'
                     placeholder='SENHA'
                     type='password'
                  />
                  <Button
                     color='light'
                     disabled={isLoading}
                     className='w-2/3 max-w-xs bg-blue-500 enabled:hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md'
                     type='submit'
                  >
                     {isLoading ? (
                        <Spinner
                           color='failure'
                           aria-label='Failure spinner example'
                        />
                     ) : (
                        <span className='text-sm'>Entrar</span>
                     )}
                  </Button>
               </form>
            </div>
         </div>

         {/* Modal de Alteração de Senha */}
         <ChangePasswordModal
            show={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            onSubmit={handlePasswordChange}
            token={tokenValue}
         />
      </div>
   );
};

export default LoginPage;
