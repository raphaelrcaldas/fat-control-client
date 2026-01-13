"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
   return new QueryClient({
      defaultOptions: {
         queries: {
            // Dados considerados "frescos" por 1 minuto
            staleTime: 60 * 1000,
            // Cache mantido por 5 minutos após componente desmontar
            gcTime: 5 * 60 * 1000,
            // Retry apenas 1 vez em caso de erro
            retry: 1,
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
