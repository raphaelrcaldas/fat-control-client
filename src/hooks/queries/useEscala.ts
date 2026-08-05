import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
   getEscalaDisponiveis,
   type GetEscalaParams,
} from "services/routes/ops/escala";

export const escalaKeys = {
   all: ["escala"] as const,
   lists: () => [...escalaKeys.all, "list"] as const,
   list: (params?: GetEscalaParams) => [...escalaKeys.lists(), params] as const,
};

/**
 * `params` já vem pronto ou `undefined` — quem monta decide o que é um filtro
 * completo (ver `escalaParamsFromFilters`). Antes o hook repetia essa checagem
 * com regras próprias, e as duas cópias já divergiam: só a da página exigia
 * `date_end >= date_start`.
 */
export function useEscala(params?: GetEscalaParams) {
   return useQuery({
      // Sem params a key ainda precisa ser única. Usar `escalaKeys.lists()`
      // aqui colocava dado sob a mesma key que serve de PREFIXO de invalidação
      // de todas as listas.
      queryKey: params ? escalaKeys.list(params) : escalaKeys.list(undefined),
      queryFn: ({ signal }) =>
         getEscalaDisponiveis(params as GetEscalaParams, signal),
      enabled: Boolean(params),
      placeholderData: keepPreviousData,
      staleTime: 0,
   });
}
