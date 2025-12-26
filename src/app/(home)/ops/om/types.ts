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

export const PROJETOS = ["kc-390"] as const;
export type ProjetoType = (typeof PROJETOS)[number];

export interface FiltrosOrdem {
   busca: string;
   status: string[];
   tipo: string;
   dataInicio: string;
   dataFim: string;
}

export type StatusType = "Rascunho" | "Elaborada" | "Finalizada" | "Revisada";

// Tipos para seleção de tripulantes
export type FuncaoTripulante = "pil" | "mc" | "lm" | "tf" | "oe" | "os";
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

export const FUNCAO_LABELS: Record<FuncaoTripulante, string> = {
   pil: "Piloto",
   mc: "Mecânico",
   lm: "Loadmaster",
   tf: "Comissário",
   oe: "OE-3",
   os: "Observador SAR",
};

export const TODAS_FUNCOES: FuncaoTripulante[] = [
   "pil",
   "mc",
   "lm",
   "tf",
   "oe",
   "os",
];

// Campos Especiais (estrutura livre)
export interface CampoEspecial {
   label: string;
   valor: string;
}
