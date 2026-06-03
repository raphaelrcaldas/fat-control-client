"use client";

import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { getQueryClient } from "@/lib/queryClient";
import { ChangePassword } from "./changePassword";

const ChangePasswordPage = () => {
   const router = useRouter();

   // Primeiro login: troca de senha obrigatória. Se o usuário desistir,
   // o escape é encerrar a sessão semiautenticada e voltar ao login —
   // o proxy redireciona para o FATLOGIN ao não encontrar o cookie.
   const handleBackToLogin = () => {
      getQueryClient().clear();
      deleteCookie("token", { path: "/" });
      router.refresh();
   };

   return (
      <ChangePassword
         onCancel={handleBackToLogin}
         cancelLabel="Voltar ao login"
      />
   );
};

export default ChangePasswordPage;
