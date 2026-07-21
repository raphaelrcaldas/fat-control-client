import { z } from "zod";
import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiPaginatedResponse, ApiResult } from "@/types/api";

import { cegepRoute } from ".";
import { UserPublic } from "../users";
import { Cidade } from "../cities";

// Re-export de constants de etiquetas
export {
   CORES_PREDEFINIDAS as coresPredefinidas,
   type CorPredefinida,
   isCorPredefinida,
} from "../../../src/constants/cegep/etiquetas";

const missoesRoute = cegepRoute + "missoes/";
const etiquetasRoute = missoesRoute + "etiquetas";

export interface Etiqueta {
   id?: number;
   nome: string;
   cor: string;
   descricao?: string;
}

export interface UserMission {
   id?: number;
   frag_id?: number;
   sit: string;
   p_g: string;
   user_id: number;
   user: UserPublic;
}

export interface Pernoite {
   id?: number;
   frag_id?: number;
   data_ini: string;
   data_fim: string;
   acrec_desloc: boolean;
   meia_diaria: boolean;
   obs: string;
   cidade_id: number;
   cidade?: Cidade;
   custo?: {
      subtotal: number;
      ac_desloc: number;
      vals: { valor: number; qtd: number }[];
      dias: number;
   };
}

export interface MissaoLogUser {
   id: number;
   p_g: string;
   nome_guerra: string;
}

export interface MissaoLogSnapshot {
   tipo_doc: string;
   n_doc: string;
   desc: string;
   afast: string;
   regres: string;
   indenizavel: boolean;
   acrec_desloc: boolean;
   tipo: string;
   obs: string;
   // Ausentes em logs antigos — tratar como lista vazia, nunca quebrar.
   militares?: { user_id: number; nome: string; p_g: string; sit: string }[];
   pernoites?: {
      cidade: string;
      data_ini: string;
      data_fim: string;
      acrec_desloc: boolean;
      meia_diaria: boolean;
      obs: string | null;
   }[];
   etiquetas?: string[];
}

export interface MissaoLog {
   id: number;
   user: MissaoLogUser;
   action: string;
   before: MissaoLogSnapshot | null;
   after: MissaoLogSnapshot | null;
   timestamp: string;
}

export interface Missao {
   id?: number;
   tipo_doc: string;
   n_doc: string;
   desc: string;
   afast: string;
   regres: string;
   indenizavel: boolean;
   acrec_desloc: boolean;
   obs: string;
   tipo: string;
   pernoites?: Pernoite[];
   users?: UserMission[];
   dias?: number;
   diarias?: number;
   valor_total?: number;
   qtd_ac?: number;
   // true quando o cache de custos não cobre o pg+sit lido (valor pode
   // estar desatualizado — exige recálculo da missão)
   custo_inconsistente?: boolean;
   etiquetas?: Etiqueta[];
   logs?: MissaoLog[];
}

export interface MissoesPaginatedResponse {
   items: Missao[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

// ============ CALCULADORA (SIMULAÇÃO) ============

export type SituacaoSimulacao = "c" | "d" | "g";

/** Linha da tabela "Militares" da calculadora: PG genérico + quantidade. */
export interface CombinacaoSimulacao {
   p_g: string;
   sit: SituacaoSimulacao;
   qtd: number;
}

export interface SimularMissaoRequest {
   acrec_desloc: boolean;
   pernoites: {
      data_ini: string;
      data_fim: string;
      cidade_id: number;
      meia_diaria: boolean;
      acrec_desloc: boolean;
   }[];
   combinacoes: CombinacaoSimulacao[];
}

export interface SimulacaoCombinacaoResultado {
   p_g: string;
   sit: SituacaoSimulacao;
   qtd: number;
   valor_unitario: number;
   subtotal: number;
}

export interface SimulacaoValorParcela {
   valor: number;
   qtd: number;
}

/** Memória de cálculo de uma combinação (p_g, sit) dentro de um pernoite específico — valores unitários (1 militar), não multiplicados pela quantidade da combinação. */
export interface SimulacaoPernoiteCombinacao {
   p_g: string;
   sit: SituacaoSimulacao;
   vals: SimulacaoValorParcela[];
   subtotal: number;
}

export interface SimulacaoPernoiteResultado {
   indice: number;
   cidade_id: number;
   grupo_cid: number;
   data_ini: string;
   data_fim: string;
   dias: number;
   ac_desloc: number;
   combinacoes: SimulacaoPernoiteCombinacao[];
}

export interface SimulacaoResultado {
   total_geral: number;
   total_dias: number;
   total_diarias: number;
   acrec_desloc_missao: number;
   valores_zerados: boolean;
   combinacoes: SimulacaoCombinacaoResultado[];
   pernoites: SimulacaoPernoiteResultado[];
}

const simularMissaoRoute = missoesRoute + "simular";

/** Limite superior de militares por combinação (p_g, sit) na calculadora. */
export const MAX_QTD_MILITARES = 99;

/**
 * Schema Zod do payload de `simularMissao`. Espelha `SimularMissaoRequest` —
 * validação client-side antes do request evita ida-e-volta ao backend por
 * erro que já dá para pegar aqui (data em formato errado, qtd fora do
 * limite etc.).
 */
export const SimularMissaoRequestSchema = z.object({
   acrec_desloc: z.boolean(),
   pernoites: z
      .array(
         z.object({
            data_ini: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
            data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
            cidade_id: z.number().int().positive("Cidade obrigatória"),
            meia_diaria: z.boolean(),
            acrec_desloc: z.boolean(),
         })
      )
      .min(1, "Adicione ao menos um pernoite"),
   combinacoes: z
      .array(
         z.object({
            p_g: z.string().min(1, "Posto/Grad obrigatório"),
            sit: z.enum(["c", "d", "g"]),
            qtd: z
               .number()
               .int()
               .min(1, "Quantidade mínima é 1")
               .max(
                  MAX_QTD_MILITARES,
                  `Quantidade máxima é ${MAX_QTD_MILITARES}`
               ),
         })
      )
      .min(1, "Adicione ao menos uma combinação de militar"),
});

export type SimularMissaoRequestValidated = z.infer<
   typeof SimularMissaoRequestSchema
>;

/**
 * Simula o custo de uma missão em fase de planejamento (nada persiste).
 * Reusa a mesma regra de cálculo do cadastro real (`calcular_custos_frag_mis`
 * no backend), mas com PG genérico + quantidade no lugar de militar nominal.
 *
 * Diferente de `getFragMissoes`, o contrato local desta função é retornar
 * `ApiResult` (não lançar) — a falha de validação Zod vira `ok: false`, igual
 * a um erro de negócio do backend, para o caller tratar de forma uniforme.
 */
export async function simularMissao(
   payload: SimularMissaoRequest,
   signal?: AbortSignal
): Promise<ApiResult<SimulacaoResultado>> {
   const parsed = SimularMissaoRequestSchema.safeParse(payload);
   if (!parsed.success) {
      const resumo = parsed.error.issues
         .map((i) => `${i.path.join(".")}: ${i.message}`)
         .join("; ");
      return {
         ok: false,
         data: null,
         message: `Parâmetros inválidos: ${resumo}`,
         errors: null,
      };
   }

   return parseApiResponse<SimulacaoResultado>(
      await request("POST", simularMissaoRoute, payload, undefined, signal)
   );
}

/**
 * Schema Zod para validação de parâmetros de filtro de missões.
 * Espelha o modelo Pydantic MissoesFilterParams do backend.
 *
 * Validação de entrada para prevenir SQL injection e DoS attacks.
 * Todos os parâmetros são opcionais exceto page e per_page.
 */
export const MissoesRequestSchema = z.object({
   // Filtros
   tipo_doc: z
      .string()
      .max(20, "Tipo de documento deve ter no máximo 20 caracteres")
      .optional(),

   n_doc: z
      .string()
      .regex(/^\d+$/, "Número do documento deve conter apenas dígitos")
      .max(10, "Número do documento deve ter no máximo 10 caracteres")
      .optional(),

   tipo: z
      .string()
      .max(20, "Tipo da missão deve ter no máximo 20 caracteres")
      .optional(),

   user_search: z
      .string()
      .max(100, "Busca de usuário deve ter no máximo 100 caracteres")
      .optional(),

   city: z
      .string()
      .max(100, "Nome da cidade deve ter no máximo 100 caracteres")
      .optional(),

   ini: z
      .string()
      .optional()
      .refine(
         (val) => !val || !isNaN(Date.parse(val)),
         "Data inicial deve ser uma data válida"
      ),

   fim: z
      .string()
      .optional()
      .refine(
         (val) => !val || !isNaN(Date.parse(val)),
         "Data final deve ser uma data válida"
      ),

   etiqueta_ids: z
      .string()
      .regex(
         /^[\d,\s]+$/,
         "IDs de etiquetas devem ser números separados por vírgula"
      )
      .max(200, "IDs de etiquetas devem ter no máximo 200 caracteres")
      .optional(),

   // Paginação
   page: z
      .number()
      .int("Página deve ser um número inteiro")
      .min(1, "Página deve ser no mínimo 1")
      .default(1),

   per_page: z
      .number()
      .int("Itens por página deve ser um número inteiro")
      .min(1, "Deve haver pelo menos 1 item por página")
      .max(100, "Máximo de 100 itens por página para prevenir DoS")
      .default(20),
});

/**
 * Tipo TypeScript inferido do schema Zod.
 * Garante type safety em toda a aplicação.
 */
export type MissoesRequest = z.infer<typeof MissoesRequestSchema>;

/**
 * Obtém missões com filtros e paginação.
 *
 * @param reqs - Parâmetros de filtro e paginação (opcionais)
 * @returns Promise com resposta paginada de missões
 * @throws Error se a validação falhar ou se houver erro na API
 *
 * @example
 * ```typescript
 * // Buscar missões com filtros
 * const missoes = await getFragMissoes({
 *    tipo: "FRAG",
 *    city: "Brasília",
 *    page: 1,
 *    per_page: 20
 * });
 * ```
 */
export async function getFragMissoes(
   reqs?: Partial<MissoesRequest>,
   signal?: AbortSignal
): Promise<MissoesPaginatedResponse> {
   try {
      // Validar e sanitizar parâmetros usando schema Zod
      const validatedParams = MissoesRequestSchema.partial().parse(reqs || {});

      // Remover valores undefined, null e strings vazias antes de enviar
      const params = Object.fromEntries(
         Object.entries(validatedParams).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
         )
      );

      // Converter valores para string para URLSearchParams
      const stringParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(params)) {
         if (value !== undefined && value !== null) {
            stringParams[key] = String(value);
         }
      }

      const response = await request(
         "GET",
         missoesRoute,
         null,
         stringParams,
         signal
      );

      const json = (await response.json()) as ApiPaginatedResponse<Missao>;

      if (!response.ok) {
         throw new Error(
            json.message ||
               `API error: ${response.status} ${response.statusText}`
         );
      }

      return {
         items: json.data || [],
         total: json.total,
         page: json.page,
         per_page: json.per_page,
         pages: json.pages,
      };
   } catch (error) {
      // Tratamento específico para erros de validação Zod
      if (error instanceof z.ZodError) {
         console.error("Validation error:", error.issues);
         const messages = error.issues
            .map((err) => `${err.path.join(".")}: ${err.message}`)
            .join(", ");
         throw new Error(`Invalid request parameters: ${messages}`);
      }
      // Re-throw outros erros
      throw error;
   }
}

export async function getFragMissao(
   id: number,
   signal?: AbortSignal
): Promise<Missao> {
   const response = await request(
      "GET",
      missoesRoute + id,
      null,
      undefined,
      signal
   );
   const json = (await response.json()) as ApiResponse<Missao>;
   if (!response.ok) {
      throw new Error(
         json.message || `API error: ${response.status} ${response.statusText}`
      );
   }
   return json.data as Missao;
}

export async function createUpdateFragMis(
   missao: Missao
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("POST", missoesRoute, missao));
}

export async function deleteFragMis(fragId: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", missoesRoute + fragId)
   );
}

// ============ ETIQUETAS API FUNCTIONS ============

export async function getEtiquetas(signal?: AbortSignal): Promise<Etiqueta[]> {
   const response = await request(
      "GET",
      etiquetasRoute,
      null,
      undefined,
      signal
   );
   const json = (await response.json()) as ApiResponse<Etiqueta[]>;
   if (!response.ok) {
      throw new Error(
         json.message || `Erro ao buscar etiquetas (${response.status})`
      );
   }
   return json.data || [];
}

export interface CidadePernoite extends Cidade {
   usos: number;
   mais_usada: boolean;
}

const cidadesPernoiteRoute = missoesRoute + "pernoites/cidades";

export const cidadePernoiteKeys = {
   all: ["pernoite-cidades"] as const,
   search: (term: string) => [...cidadePernoiteKeys.all, term] as const,
};

export async function getCidadesPernoite(
   search: string,
   signal?: AbortSignal
): Promise<CidadePernoite[]> {
   const response = await request(
      "GET",
      cidadesPernoiteRoute,
      null,
      { search },
      signal
   );
   const json = (await response.json()) as ApiResponse<CidadePernoite[]>;
   if (!response.ok) {
      throw new Error(
         json.message || `Erro ao buscar cidades (${response.status})`
      );
   }
   return json.data || [];
}

export async function createUpdateEtiqueta(
   etiqueta: Etiqueta
): Promise<Etiqueta> {
   const response = await request("POST", etiquetasRoute, etiqueta);
   const json: ApiResponse<Etiqueta> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao criar/atualizar etiqueta");
   }
   return json.data as Etiqueta;
}

export async function deleteEtiquetaApi(etiquetaId: number): Promise<void> {
   const response = await request("DELETE", `${etiquetasRoute}/${etiquetaId}`);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao deletar etiqueta");
   }
}
