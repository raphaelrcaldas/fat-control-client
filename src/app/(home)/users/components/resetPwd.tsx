import { resetPassword } from "services/routes/users";
import { Button } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState } from "react";
import { useToast } from "@/app/context/toast";
import {
   HiKey,
   HiExclamation,
   HiCheckCircle,
   HiShieldCheck,
} from "react-icons/hi";

export function ResetPassword({ userId }) {
   const [isLoading, setIsLoading] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);
   const [resetSuccess, setResetSuccess] = useState(false);

   const { push } = useToast();

   const handlePasswordReset = async () => {
      setIsLoading(true);

      try {
         const response = await resetPassword(userId);
         const data = await response.json();
         if (response.ok) {
            push({
               message: data.detail || "Senha resetada com sucesso",
               type: "success",
            });
            setResetSuccess(true);
            setShowConfirm(false);
         } else {
            push({
               message: data.detail || "Erro ao resetar senha",
               type: "error",
            });
            setShowConfirm(false);
         }
      } catch (err: any) {
         push({
            message: err?.message || "Erro ao resetar senha",
            type: "error",
         });
         setShowConfirm(false);
      } finally {
         setIsLoading(false);
      }
   };

   if (resetSuccess) {
      return (
         <div className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 animate-pulse rounded-full bg-green-100 p-4">
               <HiCheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
               Senha Redefinida!
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
               A senha foi redefinida com sucesso. O usuário receberá as novas
               credenciais.
            </p>
            <Button color="gray" onClick={() => setResetSuccess(false)}>
               Fechar
            </Button>
         </div>
      );
   }

   if (showConfirm) {
      return (
         <div className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 rounded-full bg-yellow-100 p-4">
               <HiExclamation className="h-16 w-16 text-yellow-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
               Confirmar Redefinição
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
               Tem certeza que deseja redefinir a senha deste usuário? Esta ação
               não pode ser desfeita.
            </p>
            <div className="flex gap-3">
               <Button
                  color="gray"
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
               >
                  Cancelar
               </Button>
               <Button
                  color="red"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
               >
                  {isLoading ? (
                     <>
                        <Spinner size="sm" color="white" />
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
      <div className="flex flex-col items-center justify-center p-12">
         <div className="w-full max-w-lg">
            {/* Card informativo */}
            <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
               <div className="flex items-start gap-3">
                  <HiShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
                  <div>
                     <h4 className="mb-1 font-semibold text-blue-900">
                        Redefinição de Senha
                     </h4>
                     <p className="text-sm text-blue-700">
                        A senha do usuário será redefinida para o padrão do
                        sistema. Uma nova senha temporária será gerada.
                     </p>
                  </div>
               </div>
            </div>

            {/* Card principal */}
            <div className="rounded-lg border-2 border-gray-200 bg-white p-8 text-center">
               <div className="mb-4 inline-flex rounded-full bg-gray-100 p-4">
                  <HiKey className="h-12 w-12 text-gray-600" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Resetar Senha do Usuário
               </h3>
               <p className="mb-6 text-gray-600">
                  Clique no botão abaixo para iniciar o processo de redefinição
                  de senha.
               </p>
               <Button
                  color="blue"
                  size="lg"
                  onClick={() => setShowConfirm(true)}
                  className="w-full"
               >
                  <HiKey className="mr-2 h-5 w-5" />
                  Redefinir Senha
               </Button>
            </div>

            {/* Avisos de segurança */}
            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
               <div className="flex items-start gap-2">
                  <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                     <p className="mb-1 font-medium">Aviso de Segurança</p>
                     <ul className="list-inside list-disc space-y-1 text-yellow-700">
                        <li>Esta ação é irreversível</li>
                        <li>A senha atual será invalidada imediatamente</li>
                        <li>
                           O usuário precisará usar a nova senha temporária
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
