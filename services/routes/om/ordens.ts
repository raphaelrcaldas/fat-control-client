import request from "../../Api";

const omRoute = "ops/om/";

// --- Tipos alinhados com o backend ---

export interface CampoEspecial {
   label: string;
   valor: string;
}

export interface Etiqueta {
   id: number;
   nome: string;
   cor: string;
   descricao: string | null;
}

export interface EtapaCreate {
   dt_dep: string; // ISO datetime
   origem: string;
   dest: string;
   dt_arr: string; // ISO datetime
   alternativa: string;
   tvoo_alt: number; // minutos
   qtd_comb: number;
   esf_aer: string;
}

export interface EtapaOut extends EtapaCreate {
   id: number;
   ordem_id: number;
   tvoo_etp: number; // calculado pelo backend
}

export interface EtapaListItem {
   dt_dep: string; // ISO datetime
   origem: string;
   dest: string;
}

export interface TripulanteInfo {
   id: number;
   trig: string;
   p_g: string;
   nome_guerra: string;
   nome_completo: string;
}

export interface TripulacaoOrdemOut {
   id: number;
   tripulante_id: number;
   funcao: string;
   p_g: string; // snapshot do posto/graduacao no momento da criacao da OM
   tripulante: TripulanteInfo | null;
}

// Tripulacao agrupada por funcao (formato do frontend para envio)
export interface TripulacaoAgrupada {
   pil: number[];
   mc: number[];
   lm: number[];
   tf: number[];
   oe: number[];
   os: number[];
}

export interface OrdemMissaoCreate {
   matricula_anv: number;
   tipo: string;
   projeto: string;
   status: string;
   campos_especiais: CampoEspecial[];
   doc_ref?: string | null;
   uae: string;
   etapas: EtapaCreate[];
   tripulacao?: TripulacaoAgrupada | null;
   etiquetas_ids: number[];
}

export interface OrdemMissaoUpdate {
   matricula_anv?: number | null;
   tipo?: string | null;
   doc_ref?: string | null;
   projeto?: string | null;
   status?: string | null;
   campos_especiais?: CampoEspecial[] | null;
   etapas?: EtapaCreate[] | null;
   tripulacao?: TripulacaoAgrupada | null;
   etiquetas_ids?: number[] | null;
}

export interface OrdemMissaoOut {
   id: number;
   numero: string;
   matricula_anv: number;
   tipo: string;
   projeto: string;
   status: string;
   campos_especiais: CampoEspecial[];
   doc_ref: string | null;
   data_saida: string | null;
   uae: string;
   created_by: number;
   created_at: string;
   updated_at: string | null;
   deleted_at: string | null;
   etapas: EtapaOut[];
   tripulacao: TripulacaoOrdemOut[];
   etiquetas: Etiqueta[];
}

export interface OrdemMissaoList {
   id: number;
   numero: string;
   matricula_anv: number;
   tipo: string;
   projeto: string;
   status: string;
   created_at: string;
   doc_ref: string | null;
   data_saida: string | null;
   uae: string;
   etapas: EtapaListItem[];
   etiquetas: Etiqueta[];
}

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

// --- Filtros ---

export interface OrdemFilters {
   page?: number;
   per_page?: number;
   status?: string[];
   status_ne?: string; // Status para excluir (not equal)
   tipo?: string;
   data_inicio?: string;
   data_fim?: string;
   busca?: string;
   etiquetas_ids?: number[];
}

// --- Helpers de erro ---

interface PydanticError {
   loc: (string | number)[];
   msg: string;
   type: string;
}

interface ApiError {
   detail: string | PydanticError[];
}

/**
 * Formata erros de validação do Pydantic para exibição
 */
function formatApiError(error: ApiError): string {
   if (typeof error.detail === "string") {
      return error.detail;
   }

   if (Array.isArray(error.detail)) {
      return error.detail
         .map((e) => {
            const field = e.loc.slice(1).join(" → ");
            return `${field}: ${e.msg}`;
         })
         .join("; ");
   }

   return "Erro desconhecido";
}

// --- Funcoes de API ---

export async function listOrdens(
   filters?: OrdemFilters
): Promise<PaginatedResponse<OrdemMissaoList>> {
   const params: Record<string, string | number> = {};

   if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.per_page) params.per_page = filters.per_page;
      if (filters.status_ne) params.status_ne = filters.status_ne;
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.busca) params.busca = filters.busca;
   }

   // Status e etiquetas são arrays, precisam de tratamento especial
   let url = omRoute;
   const queryParams = new URLSearchParams();

   // Outros params simples
   for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, String(value));
   }

   // Status (array)
   if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((s) => queryParams.append("status", s));
   }

   // Etiquetas (array)
   if (filters?.etiquetas_ids && filters.etiquetas_ids.length > 0) {
      filters.etiquetas_ids.forEach((id) =>
         queryParams.append("etiquetas_ids", String(id))
      );
   }

   const fullUrl = queryParams.toString()
      ? `${url}?${queryParams.toString()}`
      : url;

   const response = await request("GET", fullUrl);
   return (await response.json()) as PaginatedResponse<OrdemMissaoList>;
}

export async function getOrdem(id: number): Promise<OrdemMissaoOut> {
   const response = await request("GET", `${omRoute}${id}`);
   if (!response.ok) {
      throw new Error("Ordem de missão não encontrada");
   }
   return (await response.json()) as OrdemMissaoOut;
}

export async function createOrdem(
   ordem: OrdemMissaoCreate
): Promise<OrdemMissaoOut> {
   const response = await request("POST", omRoute, ordem);
   if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(formatApiError(error) || "Erro ao criar ordem de missão");
   }
   return (await response.json()) as OrdemMissaoOut;
}

export async function updateOrdem(
   id: number,
   ordem: OrdemMissaoUpdate
): Promise<OrdemMissaoOut> {
   const response = await request("PUT", `${omRoute}${id}`, ordem);
   if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(
         formatApiError(error) || "Erro ao atualizar ordem de missão"
      );
   }
   return (await response.json()) as OrdemMissaoOut;
}

export async function deleteOrdem(id: number): Promise<{ detail: string }> {
   const response = await request("DELETE", `${omRoute}${id}`);
   if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao excluir ordem de missão");
   }
   return (await response.json()) as { detail: string };
}
