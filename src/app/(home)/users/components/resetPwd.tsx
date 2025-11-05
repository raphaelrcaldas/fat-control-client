import { resetPassword } from "services/routes/users";
import { Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { useToast } from "@/app/context/toast";

export function ResetPassword({ userId }) {
   const [isLoading, setIsLoading] = useState(false);

   const { push } = useToast();

   const handlePasswordReset = async () => {
      setIsLoading(true);

      resetPassword(userId)
         .then((res) => res.json())
         .then((data) => {
            push({
               message: data.detail,
               type: "success",
            });
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
      <div className='flex justify-center items-center h-72'>
         <div className='bg-white p-4 rounded-lg shadow-md'>
            <h2 className='text-center m-4'>Resetar Senha</h2>
            <div className='flex justify-center'>
               <Button color='blue' disabled={isLoading} onClick={handlePasswordReset}>
                  {isLoading ? (
                     <Spinner color='failure' aria-label='Loading spinner' />
                  ) : (
                     "Resetar"
                  )}
               </Button>
            </div>
         </div>
      </div>
   );
}
