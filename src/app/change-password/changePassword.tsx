import { changePassword } from "services/routes/users";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/app/context/toast";
import { useRouter } from "next/navigation";

interface changePwdSchema {
   oldPassword: string;
   newPassword: string;
   confirmPassword: string;
}

export function ChangePassword() {
   const { register, handleSubmit, reset } = useForm<changePwdSchema>();
   const [isLoading, setIsLoading] = useState(false);

   const route = useRouter();
   const { push } = useToast();

   const handlePasswordChange = async (data: changePwdSchema) => {
      setIsLoading(true);
      if (data.newPassword !== data.confirmPassword) {
         alert("As senhas não conferem.");
         setIsLoading(false);
         return;
      }
      const payload = { new_pwd: data.newPassword };
      changePassword(payload)
         .then((res) => res.json())
         .then((data) => {
            push({
               message: data.detail,
               type: "success",
            });
            route.push("/");
         })
         .catch((error) =>
            push({
               message: error.response?.data?.detail,
               type: "error",
            })
         )
         .finally(() => setIsLoading(false));
   };

   return (
      <div className='flex justify-center items-center h-full'>
         <div className='bg-white p-4 rounded-lg shadow-md'>
            <h2 className='text-center m-4'>Alterar Senha</h2>
            <form onSubmit={handleSubmit(handlePasswordChange)}>
               <div className='grid mb-4 gap-1'>
                  <Label htmlFor='newPassword'>Nova Senha</Label>
                  <TextInput
                     id='newPassword'
                     {...register("newPassword", {
                        required: true,
                        minLength: 8,
                     })}
                     type='password'
                  />
               </div>
               <div className='grid mb-4 gap-1'>
                  <Label htmlFor='confirmPassword'>Confirmar Nova Senha</Label>
                  <TextInput
                     id='confirmPassword'
                     {...register("confirmPassword", {
                        required: true,
                        minLength: 8,
                     })}
                     type='password'
                  />
               </div>
               <div className='flex justify-center'>
                  <Button type='submit' disabled={isLoading}>
                     {isLoading ? (
                        <Spinner color='failure' aria-label='Loading spinner' />
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
