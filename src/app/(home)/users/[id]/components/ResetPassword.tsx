import { Button, Spinner } from "flowbite-react";
import { useState } from "react";
import { useToast } from "@/app/context/toast";
import { useResetPassword } from "@/hooks/queries/useUsers";
import {
   HiKey,
   HiExclamation,
   HiCheckCircle,
   HiShieldCheck,
} from "react-icons/hi";

export function ResetPassword({ userId }: { userId: number }) {
   const [showConfirm, setShowConfirm] = useState(false);
   const [resetSuccess, setResetSuccess] = useState(false);
   const resetMutation = useResetPassword();

   const { push } = useToast();

   const handlePasswordReset = async () => {
      try {
         const result = await resetMutation.mutateAsync(userId);
         push({
            message: result.message || "Senha redefinida com sucesso",
            type: "success",
         });
         setResetSuccess(true);
         setShowConfirm(false);
      } catch (err: any) {
         push({
            message: err?.message || "Erro ao redefinir senha",
            type: "error",
         });
         setShowConfirm(false);
      }
   };

   if (resetSuccess) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 animate-pulse rounded-full bg-green-100 p-4">
               <HiCheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
               Senha Redefinida!
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
               A senha foi redefinida para a senha padrão do sistema. Informe-a
               ao militar; ele será obrigado a trocá-la no próximo acesso.
            </p>
            <Button color="gray" onClick={() => setResetSuccess(false)}>
               Fechar
            </Button>
         </div>
      );
   }

   if (showConfirm) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-yellow-100 p-4">
               <HiExclamation className="h-16 w-16 text-yellow-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
               Confirmar Redefinição
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
               A senha deste usuário será redefinida para a senha padrão do
               sistema. Ele será obrigado a trocá-la no próximo acesso. Esta
               ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
               <Button
                  color="gray"
                  onClick={() => setShowConfirm(false)}
                  disabled={resetMutation.isPending}
               >
                  Cancelar
               </Button>
               <Button
                  color="red"
                  onClick={handlePasswordReset}
                  disabled={resetMutation.isPending}
               >
                  {resetMutation.isPending ? (
                     <>
                        <Spinner size="sm" color="gray" />
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         {/* Coluna esquerda: informações */}
         <div className="space-y-4">
            <div className="rounded border border-blue-200 bg-blue-50 p-5">
               <div className="flex items-start gap-3">
                  <HiShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
                  <div>
                     <h4 className="mb-1 font-semibold text-blue-900">
                        Redefinição de Senha
                     </h4>
                     <p className="text-sm text-blue-700">
                        A senha será redefinida para a senha padrão do sistema.
                        Informe-a ao militar; ele será obrigado a trocá-la no
                        próximo acesso.
                     </p>
                  </div>
               </div>
            </div>

            <div className="rounded border border-yellow-200 bg-yellow-50 p-5">
               <div className="flex items-start gap-2">
                  <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                     <p className="mb-1 font-medium">Aviso de Segurança</p>
                     <ul className="list-inside list-disc space-y-1 text-yellow-700">
                        <li>Esta ação não pode ser desfeita</li>
                        <li>
                           Sessões já abertas continuam válidas até o token
                           expirar
                        </li>
                        <li>
                           O militar precisará trocar a senha no próximo acesso
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>

         {/* Coluna direita: ação */}
         <div className="rounded border border-slate-200 p-8 text-center">
            <div className="mb-4 inline-flex rounded-full bg-gray-100 p-4">
               <HiKey className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
               Redefinir Senha do Usuário
            </h3>
            <p className="mb-6 text-gray-600">
               Clique no botão abaixo para redefinir a senha para o padrão do
               sistema.
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
      </div>
   );
}
