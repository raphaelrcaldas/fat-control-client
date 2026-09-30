"use client";

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";

function makeQueryClient() {
   return new QueryClient({
      defaultOptions: {
         queries: {
            // Dados considerados "frescos" por 1 minuto
            staleTime: 60 * 1000,
            // Cache mantido por 5 minutos após componente desmontar
            gcTime: 5 * 60 * 1000,
            // 4xx é negação/ausência; repetir só atrasa o estado de erro.
            retry: (tentativa, erro) =>
               !(
                  erro instanceof ApiError &&
                  erro.status !== undefined &&
                  erro.status >= 400 &&
                  erro.status < 500
               ) && tentativa < 1,

            // Não refetch ao focar a janela (pode ativar se quiser)
            refetchOnWindowFocus: false,
         },
         mutations: {
            retry: false,
         },
      },
   });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
   // Server: sempre cria um novo client
   if (typeof window === "undefined") {
      return makeQueryClient();
   }
   // Browser: reutiliza o mesmo client
   if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
   }
   return browserQueryClient;
}
