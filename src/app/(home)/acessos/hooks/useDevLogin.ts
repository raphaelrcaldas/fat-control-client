import { useCallback, useState } from "react";
import { setCookie } from "cookies-next";
import { devLogin as devLoginApi } from "services/routes/auth";
import { getQueryClient } from "@/lib/queryClient";
import { useToast } from "@/app/context/toast";

/** Fluxo "logar como usuário" (dev login): confirmação + troca de token. */
export function useDevLogin() {
   const { push } = useToast();
   const [showModal, setShowModal] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);
   const [isLoggingIn, setIsLoggingIn] = useState(false);

   const requestLogin = useCallback((id: number) => {
      setUserId(id);
      setShowModal(true);
   }, []);

   const confirmLogin = useCallback(async () => {
      if (!userId) return;

      setIsLoggingIn(true);
      try {
         const result = await devLoginApi(userId);

         if (!result.ok) {
            push({
               type: "error",
               message: result.message || "Erro ao fazer login",
            });
            return;
         }

         if (result.data?.access_token) {
            getQueryClient().clear();
            setCookie("token", result.data.access_token, {
               maxAge: 24 * 60 * 60,
               path: "/",
            });
            push({ type: "success", message: "Login realizado com sucesso!" });
            window.location.href = "/";
         } else {
            push({ type: "error", message: "Token não recebido do servidor" });
         }
      } catch (error) {
         console.error("devLogin failed", error);
         push({ type: "error", message: "Erro ao fazer login como usuário" });
      } finally {
         setIsLoggingIn(false);
      }
   }, [userId, push]);

   return { showModal, setShowModal, isLoggingIn, requestLogin, confirmLogin };
}
