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

function paramsAreReady(p?: Partial<GetEscalaParams>): boolean {
   if (!p) return false;
   return Boolean(
      p.date_start &&
      p.date_end &&
      p.tipo_quad_id &&
      p.funcs &&
      p.funcs.length > 0 &&
      p.sort
   );
}

export function useEscala(params?: Partial<GetEscalaParams>) {
   const ready = paramsAreReady(params);
   return useQuery({
      queryKey: ready
         ? escalaKeys.list(params as GetEscalaParams)
         : escalaKeys.lists(),
      queryFn: ({ signal }) =>
         getEscalaDisponiveis(params as GetEscalaParams, signal),
      enabled: ready,
      placeholderData: keepPreviousData,
      staleTime: 0,
   });
}
