"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { getToken } from "@/services/routes/auth";
import { useForm } from "react-hook-form";
import { Button, Spinner } from "flowbite-react";
import { validateOnlyNumber } from "@/utils/textFormat";

const LoginPage = () => {
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
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
         await setCookie("token", dataR.access_token);
         router.push("/");
      } else {
         reset({ password: "" });
         alert(dataR.detail);
      }
      setIsLoading(false);
   };

   return (
      <div className='flex flex-row h-screen bg-gray-200'>
         <div className='grid items-center justify-center w-1/2 text-center'>
            <div className='flex flex-col gap-12 p-6 bg-white rounded-lg shadow-md'>
               <span className='text-4xl font-bold'>
                  FAT
                  <span className='text-red-500'>CONTROL</span>
               </span>
               <div className='grid text-gray-400'>
                  <span className='text-xl font-bold'>
                     1º/1º Grupo de Transporte
                  </span>
                  <span className='text-base font-bold'>
                     Uma Equipe, um coração.
                  </span>
               </div>
            </div>
         </div>
         <div className='grid items-center justify-center w-1/2'>
            <div className='p-8 bg-red-400 rounded-lg shadow-lg w-96'>
               <h2 className='text-center text-white uppercase'>Login</h2>
               <form onSubmit={handleSubmit(handleLogin)}>
                  <div className='px-4 mt-6'>
                     <input
                        {...register("username", {
                           required: true,
                        })}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        autoComplete='off'
                        onKeyPress={(event) => validateOnlyNumber(event)}
                        maxLength={7}
                        minLength={7}
                        placeholder='SARAM'
                     />
                  </div>
                  <div className='px-4 mt-5'>
                     <input
                        {...register("password", {
                           required: true,
                        })}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        autoComplete='off'
                        placeholder='SENHA'
                        type='password'
                     />
                  </div>
                  <div className='grid mt-5 justify-items-center'>
                     <Button
                        color='blue'
                        disabled={isLoading}
                        className='w-1/2'
                        type='submit'
                     >
                        {isLoading ? (
                           <>
                              <Spinner
                                 color='failure'
                                 aria-label='Failure spinner example'
                              />
                           </>
                        ) : (
                           <span className='text-lg'>Entrar</span>
                        )}
                     </Button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default LoginPage;
