export interface Etapa {
   dataDecolagem: string;
   horaDecolagem: string;
   origem: string;
   eta: string;
   destino: string;
   alternativa: string;
   tempoVooEtapa: string;
   tempoVooAlternativa: string;
   quantidadeCombustivel: string;
   esforcoAereo: string;
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
}

export type StatusType = "Rascunho" | "Elaborada" | "Finalizada" | "Revisada";

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
   oper: OperacionalidadeType;
   posto_ant: number;
   ult_promo: string | null;
   ant_rel: number | null;
   id_fab: number | null;
}

// Cada função pode ter múltiplos tripulantes
export interface TripulacaoOrdem {
   pil: TripulanteSearchResult[];
   mc: TripulanteSearchResult[];
   lm: TripulanteSearchResult[];
   tf: TripulanteSearchResult[];
   oe: TripulanteSearchResult[];
   os: TripulanteSearchResult[];
}

// FUNCAO_LABELS e TODAS_FUNCOES agora vêm de @/constants/tripulantes (re-exportados acima)

// Campos Especiais (estrutura livre)
export interface CampoEspecial {
   label: string;
   valor: string;
}
