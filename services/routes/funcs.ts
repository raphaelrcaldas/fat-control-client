import request, { parseApiResponse } from "../Api";
import type { ApiResult } from "@/types/api";

// Re-export dos tipos/labels de operacionalidade, que continuam estáticos:
// 'ba/op/in/al' é doutrina, igual em qualquer unidade. A FUNÇÃO, não — virou
// dado (tabelas `funcoes` e `funcoes_uae`) e vem por HTTP daqui.
export {
   type OperType,
   OPER_LABELS,
   TODOS_NIVEIS_OPER,
   getOperLabel,
} from "../../src/constants/tripulantes/operacionalidade";

import type { OperType } from "../../src/constants/tripulantes";

/** Código da função ('pil', 'mc', ...). Lista fechada não existe mais. */
export type FuncType = string;

export interface FuncaoPosicao {
   id: number;
   func_cod: string;
   /** Código da posição a bordo ('1P', 'IN', ...). */
   cod: string;
   nome: string;
   descricao: string | null;
   tipo: "titular" | "instrutor" | "aluno";
   ordem: number;
}

/** Função como a unidade a enxerga (rótulo e ordem já efetivos). */
export interface FuncaoOrg {
   cod: string;
   nome: string;
   nome_curto: string;
   cor: string;
   ordem: number;
   esporadica: boolean;
   posicoes: FuncaoPosicao[];
}

/** Entrada do catálogo global (control-plane do admin de sistema). */
export interface Funcao extends FuncaoOrg {
   active: boolean;
}

export interface FuncaoUpsert {
   nome: string;
   nome_curto: string;
   cor: string;
   ordem: number;
   esporadica: boolean;
   active: boolean;
}

export interface FuncaoOrgItem {
   cod: string;
   nome_custom?: string | null;
   ordem?: number | null;
}

export interface FuncaoPosicaoInput {
   cod: string;
   nome: string;
   descricao?: string | null;
   tipo: "titular" | "instrutor" | "aluno";
   ordem: number;
}

/**
 * Campos da função única (1:1) do tripulante. Vivem diretamente no
 * tripulante (colunas `func`/`oper`/`proj`/`data_op`), não em entidade
 * separada.
 *
 * `func` é FK para `funcoes.cod` e o conjunto válido é o que a org opera
 * (`GET /config/funcoes`); `proj` é o `modelo` do projeto, obtido em
 * `GET /aeronaves/projetos`.
 */
export interface TripFuncFields {
   func: FuncType;
   oper: OperType;
   proj: string;
   data_op: string | null;
}

// ============================================================================
// Catálogo global (leitura por qualquer usuário autenticado)
// ============================================================================

export async function getFuncoesCatalogo(
   signal?: AbortSignal,
   incluirInativas = false
): Promise<Funcao[]> {
   const query = incluirInativas ? "?incluir_inativas=true" : "";
   const result = await parseApiResponse<Funcao[]>(
      await request("GET", `funcoes/${query}`, null, null, signal)
   );
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar funções");
   }
   return result.data ?? [];
}

// ============================================================================
// Funções operadas pela org ativa
// ============================================================================

export async function getFuncoesOrg(
   signal?: AbortSignal
): Promise<FuncaoOrg[]> {
   const result = await parseApiResponse<FuncaoOrg[]>(
      await request("GET", "config/funcoes", null, null, signal)
   );
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar funções da unidade");
   }
   return result.data ?? [];
}

export async function setFuncoesOrg(
   funcoes: FuncaoOrgItem[]
): Promise<ApiResult<FuncaoOrg[]>> {
   return parseApiResponse<FuncaoOrg[]>(
      await request("PUT", "config/funcoes", { funcoes })
   );
}

// ============================================================================
// Catálogo — escrita (admin de sistema)
// ============================================================================

export async function createFuncao(
   data: FuncaoUpsert & { cod: string }
): Promise<ApiResult<Funcao>> {
   return parseApiResponse<Funcao>(
      await request("POST", "admin/funcoes/", data)
   );
}

export async function updateFuncao(
   cod: string,
   data: FuncaoUpsert
): Promise<ApiResult<Funcao>> {
   return parseApiResponse<Funcao>(
      await request("PUT", `admin/funcoes/${cod}`, data)
   );
}

export async function deleteFuncao(cod: string): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `admin/funcoes/${cod}`)
   );
}

export async function setFuncaoPosicoes(
   cod: string,
   posicoes: FuncaoPosicaoInput[]
): Promise<ApiResult<Funcao>> {
   return parseApiResponse<Funcao>(
      await request("PUT", `admin/funcoes/${cod}/posicoes`, { posicoes })
   );
}
