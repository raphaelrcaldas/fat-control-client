import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getFuncoesCatalogo,
   getFuncoesOrg,
   setFuncoesOrg,
   createFuncao,
   updateFuncao,
   deleteFuncao,
   setFuncaoPosicoes,
   type Funcao,
   type FuncaoOrg,
   type FuncaoOrgItem,
   type FuncaoPosicao,
   type FuncaoPosicaoInput,
   type FuncaoUpsert,
} from "services/routes/funcs";
import {
   getFuncColors,
   type FuncColorSet,
} from "@/constants/tripulantes/funcoes";
import { useAuth } from "@/app/context/auth";

// A org é implícita (org ativa do token) mas entra na key: trocar de org no
// OrgSwitcher tem de trocar o conjunto de funções, não reaproveitar o
// anterior. O catálogo global não depende de org.
export const funcoesKeys = {
   all: ["funcoes"] as const,
   catalogo: (incluirInativas: boolean) =>
      [...funcoesKeys.all, "catalogo", incluirInativas] as const,
   org: (activeOrg: string | null) =>
      [...funcoesKeys.all, "org", activeOrg ?? "sistema"] as const,
};

/** Catálogo de funções da org ativa, com os acessos que as telas usam. */
export interface FuncoesCatalogo {
   /** Funções operadas pela unidade, já na ordem efetiva. */
   funcoes: FuncaoOrg[];
   /** Só os códigos, na ordem — substitui a antiga TODAS_FUNCOES. */
   codigos: string[];
   /** Funções não esporádicas — substitui a antiga FUNCOES_PRINCIPAIS. */
   principais: FuncaoOrg[];
   byCod: Record<string, FuncaoOrg>;
   label: (cod: string) => string;
   labelShort: (cod: string) => string;
   colors: (cod: string) => FuncColorSet;
   posicoes: (cod: string) => FuncaoPosicao[];
   /** Primeira posição da função — antiga defaultFuncBordo. */
   defaultBordo: (cod: string) => string;
   posicaoLabel: (cod: string, posicao: string) => string | undefined;
   /** Peso de ordenação por função, para listas agrupadas. */
   ordem: (cod: string) => number;
   isLoading: boolean;
   isError: boolean;
}

/**
 * Funções operadas pela org ativa.
 *
 * Fonte única de rótulo, cor e posições a bordo — o que antes era o
 * FUNCOES_CONFIG cravado no código. `staleTime` alto porque o catálogo é
 * cadastro raro (muda em /config ou /admin/funcoes, que invalidam a query).
 */
export function useFuncoes(): FuncoesCatalogo {
   const { activeOrg } = useAuth();

   const { data, isLoading, isError } = useQuery({
      queryKey: funcoesKeys.org(activeOrg),
      queryFn: ({ signal }) => getFuncoesOrg(signal),
      enabled: !!activeOrg,
      staleTime: 30 * 60_000,
   });

   return useMemo(() => {
      const funcoes = data ?? [];
      const byCod = Object.fromEntries(funcoes.map((f) => [f.cod, f]));

      return {
         funcoes,
         codigos: funcoes.map((f) => f.cod),
         principais: funcoes.filter((f) => !f.esporadica),
         byCod,
         // Função fora do conjunto da org ainda pode aparecer em dado
         // histórico (uma etapa antiga, um log): cai no próprio código em
         // caixa alta em vez de sumir da tela.
         label: (cod) => byCod[cod]?.nome ?? cod.toUpperCase(),
         labelShort: (cod) => byCod[cod]?.nome_curto ?? cod.toUpperCase(),
         colors: (cod) => getFuncColors(byCod[cod]?.cor),
         posicoes: (cod) => byCod[cod]?.posicoes ?? [],
         defaultBordo: (cod) =>
            byCod[cod]?.posicoes[0]?.cod ?? cod.toUpperCase().slice(0, 2),
         posicaoLabel: (cod, posicao) =>
            byCod[cod]?.posicoes.find((p) => p.cod === posicao)?.nome,
         ordem: (cod) => byCod[cod]?.ordem ?? 99,
         isLoading,
         isError,
      };
   }, [data, isLoading, isError]);
}

/** Catálogo global — telas de admin de sistema. */
export function useFuncoesCatalogo(incluirInativas = true) {
   return useQuery({
      queryKey: funcoesKeys.catalogo(incluirInativas),
      queryFn: ({ signal }) => getFuncoesCatalogo(signal, incluirInativas),
      staleTime: 30 * 60_000,
   });
}

export function useSetFuncoesOrg() {
   const queryClient = useQueryClient();
   const { activeOrg } = useAuth();

   return useMutation({
      mutationFn: async (funcoes: FuncaoOrgItem[]) => {
         const result = await setFuncoesOrg(funcoes);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar funções");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: funcoesKeys.org(activeOrg),
         });
      },
   });
}

function useCatalogoMutation<TVars>(
   mutationFn: (vars: TVars) => Promise<{ ok: boolean; message?: string }>,
   erroPadrao: string
) {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (vars: TVars) => {
         const result = await mutationFn(vars);
         if (!result.ok) {
            throw new Error(result.message || erroPadrao);
         }
         return result;
      },
      onSuccess: () => {
         // O catálogo alimenta também o conjunto por org (rótulo, cor,
         // posições vêm dele), então as duas famílias saem do cache.
         queryClient.invalidateQueries({ queryKey: funcoesKeys.all });
      },
   });
}

export function useCreateFuncao() {
   return useCatalogoMutation(
      (data: FuncaoUpsert & { cod: string }) => createFuncao(data),
      "Erro ao criar função"
   );
}

export function useUpdateFuncao() {
   return useCatalogoMutation(
      ({ cod, data }: { cod: string; data: FuncaoUpsert }) =>
         updateFuncao(cod, data),
      "Erro ao atualizar função"
   );
}

export function useDeleteFuncao() {
   return useCatalogoMutation(
      (cod: string) => deleteFuncao(cod),
      "Erro ao remover função"
   );
}

export function useSetFuncaoPosicoes() {
   return useCatalogoMutation(
      ({ cod, posicoes }: { cod: string; posicoes: FuncaoPosicaoInput[] }) =>
         setFuncaoPosicoes(cod, posicoes),
      "Erro ao salvar posições"
   );
}

export type { Funcao, FuncaoOrg, FuncaoPosicao, FuncaoPosicaoInput };
