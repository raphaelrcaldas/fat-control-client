import { resetPassword } from "services/routes/users";
import { Button } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState } from "react";
import { useToast } from "@/app/context/toast";
import { HiKey, HiExclamation, HiCheckCircle, HiShieldCheck } from "react-icons/hi";

export function ResetPassword({ userId }) {
   const [isLoading, setIsLoading] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);
   const [resetSuccess, setResetSuccess] = useState(false);

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
            setResetSuccess(true);
            setShowConfirm(false);
         })
         .catch((error) => {
            push({
               message: error.response?.data?.detail || "Erro ao resetar senha",
               type: "error",
            });
            setShowConfirm(false);
         })
         .finally(() => setIsLoading(false));
   };

   if (resetSuccess) {
      return (
         <div className='flex flex-col justify-center items-center p-12'>
            <div className='p-4 bg-green-100 rounded-full mb-4 animate-pulse'>
               <HiCheckCircle className='w-16 h-16 text-green-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
               Senha Redefinida!
            </h3>
            <p className='text-gray-600 text-center max-w-md mb-6'>
               A senha foi redefinida com sucesso. O usuário receberá as novas credenciais.
            </p>
            <Button
               color='gray'
               onClick={() => setResetSuccess(false)}
            >
               Fechar
            </Button>
         </div>
      );
   }

   if (showConfirm) {
      return (
         <div className='flex flex-col justify-center items-center p-12'>
            <div className='p-4 bg-yellow-100 rounded-full mb-4'>
               <HiExclamation className='w-16 h-16 text-yellow-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>
               Confirmar Redefinição
            </h3>
            <p className='text-gray-600 text-center max-w-md mb-6'>
               Tem certeza que deseja redefinir a senha deste usuário? Esta ação não pode ser desfeita.
            </p>
            <div className='flex gap-3'>
               <Button
                  color='gray'
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
               >
                  Cancelar
               </Button>
               <Button
                  color='red'
                  onClick={handlePasswordReset}
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <>
                        <Spinner size='sm' color='white' />
                        Redefinindo...
                     </>
                  ) : (
                     "Sim, Redefinir"
                  )}
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className='flex flex-col justify-center items-center p-12'>
         <div className='max-w-lg w-full'>
            {/* Card informativo */}
            <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mb-6'>
               <div className='flex items-start gap-3'>
                  <HiShieldCheck className='w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5' />
                  <div>
                     <h4 className='font-semibold text-blue-900 mb-1'>
                        Redefinição de Senha
                     </h4>
                     <p className='text-sm text-blue-700'>
                        A senha do usuário será redefinida para o padrão do sistema.
                        Uma nova senha temporária será gerada.
                     </p>
                  </div>
               </div>
            </div>

            {/* Card principal */}
            <div className='bg-white border-2 border-gray-200 rounded-lg p-8 text-center'>
               <div className='p-4 bg-gray-100 rounded-full inline-flex mb-4'>
                  <HiKey className='w-12 h-12 text-gray-600' />
               </div>
               <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Resetar Senha do Usuário
               </h3>
               <p className='text-gray-600 mb-6'>
                  Clique no botão abaixo para iniciar o processo de redefinição de senha.
               </p>
               <Button
                  color='blue'
                  size='lg'
                  onClick={() => setShowConfirm(true)}
                  className='w-full'
               >
                  <HiKey className='w-5 h-5 mr-2' />
                  Redefinir Senha
               </Button>
            </div>

            {/* Avisos de segurança */}
            <div className='mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
               <div className='flex items-start gap-2'>
                  <HiExclamation className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                  <div className='text-sm text-yellow-800'>
                     <p className='font-medium mb-1'>Aviso de Segurança</p>
                     <ul className='list-disc list-inside space-y-1 text-yellow-700'>
                        <li>Esta ação é irreversível</li>
                        <li>A senha atual será invalidada imediatamente</li>
                        <li>O usuário precisará usar a nova senha temporária</li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
