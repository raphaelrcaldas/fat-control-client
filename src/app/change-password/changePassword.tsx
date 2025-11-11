import { changePassword } from "services/routes/users";
import { Label, TextInput, Button } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/app/context/toast";
import { useRouter } from "next/navigation";

interface ChangePwdSchema {
   oldPassword: string;
   newPassword: string;
   confirmPassword: string;
}

export function ChangePassword() {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<ChangePwdSchema>();
   const [isLoading, setIsLoading] = useState(false);

   const route = useRouter();
   const { push } = useToast();

   const newPassword = watch("newPassword");

   const handlePasswordChange = async (data: ChangePwdSchema) => {
      setIsLoading(true);

      try {
         const res = await changePassword({ new_pwd: data.newPassword });
         const responseData = await res.json();

         if (!res.ok) {
            throw new Error(responseData.detail || "Erro ao alterar senha");
         }

         push({
            message: responseData.detail || "Senha alterada com sucesso!",
            type: "success",
         });
         route.push("/");
      } catch (error) {
         push({
            message:
               error instanceof Error
                  ? error.message
                  : "Erro ao alterar senha. Tente novamente.",
            type: "error",
         });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className='flex justify-center items-center h-full'>
         <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
            <h2 className='text-2xl font-semibold text-center mb-6'>
               Alterar Senha
            </h2>
            <form onSubmit={handleSubmit(handlePasswordChange)}>
               {/* <div className='mb-4'>
                  <div className='mb-2'>
                     <Label htmlFor='oldPassword'>Senha Atual</Label>
                  </div>
                  <TextInput
                     id='oldPassword'
                     {...register("oldPassword", {
                        required: "Senha atual é obrigatória",
                     })}
                     type='password'
                     color={errors.oldPassword ? "failure" : undefined}
                  />
                  {errors.oldPassword && (
                     <p className='text-red-600 text-sm mt-1'>
                        {errors.oldPassword.message}
                     </p>
                  )}
               </div> */}

               <div className='mb-4'>
                  <div className='mb-2'>
                     <Label htmlFor='newPassword'>Nova Senha</Label>
                  </div>
                  <TextInput
                     id='newPassword'
                     {...register("newPassword", {
                        required: "Nova senha é obrigatória",
                        minLength: {
                           value: 8,
                           message: "A senha deve ter no mínimo 8 caracteres",
                        },
                        pattern: {
                           value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                           message:
                              "A senha deve conter letras maiúsculas, minúsculas e números",
                        },
                     })}
                     type='password'
                     color={errors.newPassword ? "failure" : undefined}
                  />
                  {errors.newPassword && (
                     <p className='text-red-600 text-sm mt-1'>
                        {errors.newPassword.message}
                     </p>
                  )}
               </div>

               <div className='mb-6'>
                  <div className='mb-2'>
                     <Label htmlFor='confirmPassword'>
                        Confirmar Nova Senha
                     </Label>
                  </div>
                  <TextInput
                     id='confirmPassword'
                     {...register("confirmPassword", {
                        required: "Confirmação de senha é obrigatória",
                        validate: (value) =>
                           value === newPassword || "As senhas não conferem",
                     })}
                     type='password'
                     color={errors.confirmPassword ? "failure" : undefined}
                  />
                  {errors.confirmPassword && (
                     <p className='text-red-600 text-sm mt-1'>
                        {errors.confirmPassword.message}
                     </p>
                  )}
               </div>

               <div className='flex justify-center gap-3'>
                  <Button type='submit' disabled={isLoading} color='blue'>
                     {isLoading ? (
                        <>
                           <Spinner size='sm' color='white' />
                           Salvando...
                        </>
                     ) : (
                        "Salvar"
                     )}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}
