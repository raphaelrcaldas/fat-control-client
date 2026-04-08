import { z } from "zod";
import request, { parseApiResponse } from "../../Api";
import type {
   ApiResponse,
   ApiPaginatedResponse,
   ApiResult,
} from "@/types/api";

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

export interface Missao {
   id?: number;
   tipo_doc: string;
   n_doc: number;
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
   etiquetas?: Etiqueta[];
}

export interface MissoesPaginatedResponse {
   items: Missao[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
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
      .number()
      .int("Número do documento deve ser inteiro")
      .positive("Número do documento deve ser positivo")
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
            json.message || `API error: ${response.status} ${response.statusText}`
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

export async function deleteFragMis(
   fragId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", missoesRoute + fragId)
   );
}

// ============ ETIQUETAS API FUNCTIONS ============

export async function getEtiquetas(
   signal?: AbortSignal
): Promise<Etiqueta[]> {
   const response = await request("GET", etiquetasRoute, null, undefined, signal);
   const json = (await response.json()) as ApiResponse<Etiqueta[]>;
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
   const response = await request(
      "DELETE",
      `${etiquetasRoute}/${etiquetaId}`
   );
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao deletar etiqueta");
   }
}
