import { useMemo } from "react";
import { useOrganizacoes } from "./useOrganizacoes";

export interface UnidadeOption {
   value: string;
   label: string;
}

/**
 * Opções de unidade derivadas do diretório de organizações
 * (`GET /organizacoes`), no formato `{ value: sigla, label: nome }`.
 *
 * Substitui a antiga constante estática `unidadeOptions`. A query é
 * cacheada pelo TanStack Query, então múltiplos consumidores compartilham
 * uma única busca.
 */
export function useUnidadeOptions(): UnidadeOption[] {
   const { data: orgs = [] } = useOrganizacoes();
   return useMemo(
      () => orgs.map((o) => ({ value: o.sigla, label: o.nome })),
      [orgs]
   );
}
