// --- Tipos de UI (usados nos componentes do frontend) ---

export interface Etapa {
   dataDecolagem: string; // YYYY-MM-DD
   horaDecolagem: string; // HH:mm
   origem: string;
   dataPouso: string; // YYYY-MM-DD
   horaPouso: string; // HH:mm
   destino: string;
   alternativa: string;
   tempoVooAlternativa: string; // HH:mm
   quantidadeCombustivel: string;
   esforcoAereo: string;
}

export interface Etiqueta {
   id: number;
   nome: string;
   cor: string;
   descricao?: string;
}

export interface OrdemMissao {
   id: number;
   numero: string;
   documentoReferencia: string;
   matriculaAeronave: number;
   projeto: string;
   tipo: string;
   status: string;
   etapas: Etapa[];
   tripulacao?: TripulacaoOrdem;
   camposEspeciais?: CampoEspecial[];
   createdAt?: string;
   etiquetas: Etiqueta[];
}

// Re-export de constants/tripulantes
export {
   PROJETOS,
   type ProjType as ProjetoType,
} from "@/constants/tripulantes";

export interface FiltrosOrdem {
   busca: string;
   status: string[];
   tipo: string;
   dataInicio: string;
   dataFim: string;
   etiquetas_ids: number[];
}

// Re-export de constants/ops/ordens-missao
export { type StatusType } from "@/constants/ops/ordens-missao/status";

// Re-export tipos de tripulantes de constants/
export {
   type FuncaoTripulante,
   FUNCOES_PRINCIPAIS as TODAS_FUNCOES,
   FUNC_LABELS_SHORT as FUNCAO_LABELS,
} from "@/constants/tripulantes";
export type OperacionalidadeType = "ba" | "op" | "in" | "al";

export interface TripulanteSearchResult {
   id: number;
   trig: string;
   p_g: string;
   nome_guerra: string;
   nome_completo?: string;
   oper: OperacionalidadeType;
   posto_ant: number;
   ult_promo: string | null;
   ant_rel: number | null;
   id_fab: number | null;
}

// Cada funcao pode ter multiplos tripulantes (formato UI)
export interface TripulacaoOrdem {
   pil: TripulanteSearchResult[];
   mc: TripulanteSearchResult[];
   lm: TripulanteSearchResult[];
   tf: TripulanteSearchResult[];
   oe: TripulanteSearchResult[];
   os: TripulanteSearchResult[];
}

// Campos Especiais (estrutura livre)
export interface CampoEspecial {
   label: string;
   valor: string;
}

// --- Re-export tipos da API ---
export type {
   OrdemMissaoOut,
   OrdemMissaoList,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   EtapaCreate,
   EtapaOut,
   EtapaListItem,
   TripulacaoAgrupada,
   TripulacaoOrdemOut,
   TripulanteInfo,
   OrdemFilters,
   PaginatedResponse,
} from "services/routes/om";

// --- Paginacao para UI ---
export interface PaginationState {
   page: number;
   perPage: number;
   total: number;
   pages: number;
}
