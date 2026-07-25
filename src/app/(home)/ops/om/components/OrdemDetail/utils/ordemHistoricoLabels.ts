import {
   extractTime,
   formatNaiveDate,
   isoDateToString,
   minutesToTime,
} from "utils/dateHandler";
import type {
   CampoEspecialSnapshot,
   EtapaSnapshot,
   TripulanteSnapshot,
} from "./ordemHistorico";

// Vocabulário do histórico de auditoria da OM: rótulos em português e
// formatação de valores do snapshot. Mantido separado do motor de diff
// (`ordemHistorico.ts`) — aqui só entra apresentação.

/** Escalares da ordem, na ordem em que aparecem no histórico. */
export const ORDEM_SCALAR_FIELDS = [
   "numero",
   "tipo",
   "status",
   "matricula_anv",
   "projeto",
   "esf_aer",
   "data_saida",
   "doc_ref",
] as const;

export const ORDEM_SCALAR_LABELS: Record<string, string> = {
   numero: "Número",
   tipo: "Tipo",
   status: "Status",
   matricula_anv: "Matrícula",
   projeto: "Projeto",
   esf_aer: "Esforço aéreo",
   data_saida: "Data de saída",
   doc_ref: "Doc. de referência",
};

/** Campos comparados dentro de uma etapa já pareada. */
export const ETAPA_FIELDS = [
   "dt_dep",
   "dt_arr",
   "origem",
   "dest",
   "alternativa",
   "tvoo_etp",
   "tvoo_alt",
   "qtd_comb",
   "esf_aer",
] as const;

export const ETAPA_FIELD_LABELS: Record<string, string> = {
   dt_dep: "Decolagem",
   dt_arr: "Pouso",
   origem: "Origem",
   dest: "Destino",
   alternativa: "Alternativa",
   tvoo_etp: "Tempo de voo",
   tvoo_alt: "Tempo p/ alternativa",
   qtd_comb: "Combustível",
   esf_aer: "Esforço aéreo",
};

/** Campos comparados dentro de um tripulante já pareado. */
export const TRIPULANTE_FIELDS = ["funcao", "p_g", "nome"] as const;

export const TRIPULANTE_FIELD_LABELS: Record<string, string> = {
   funcao: "Função",
   p_g: "Posto/graduação",
   nome: "Nome",
};

/** Campos comparados dentro de uma ordem especial já pareada. */
export const CAMPO_ESPECIAL_FIELDS = ["label", "valor"] as const;

export const CAMPO_ESPECIAL_FIELD_LABELS: Record<string, string> = {
   label: "Rótulo",
   valor: "Valor",
};

export const LISTA_LABELS: Record<string, string> = {
   tripulacao: "Tripulação",
   etapas: "Etapas",
   campos_especiais: "Ordens especiais",
   etiquetas: "Etiquetas",
};

/** Texto exibido no lugar de um valor ausente/vazio dos dois lados do diff. */
export const VALOR_VAZIO = "(vazio)";

// Torna legível um token de enum do backend ("ordem_missao" -> "Ordem missao"):
// troca "_" por espaço e capitaliza. Sem tabela de tradução — só desengessa.
function humanizeToken(value: string): string {
   const spaced = value.replace(/_/g, " ");
   return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Datetime de etapa (ISO com offset UTC) para "DD/MM/YY HH:MMZ" — mesmo
 * formato da EtapasTable, para o histórico falar a língua da tela.
 */
export function formatEtapaDatetime(iso: string): string {
   const date = isoDateToString(iso);
   const time = extractTime(iso);
   if (!date) return iso;
   return time ? `${date} ${time}Z` : date;
}

/**
 * Formata um valor do snapshot para exibição. Devolve `null` quando o campo
 * está ausente (o backend omite `doc_ref` vazio), nulo ou em branco — quem
 * renderiza decide como mostrar a ausência.
 */
export function formatSnapshotValue(
   field: string,
   value: unknown
): string | null {
   if (value === null || value === undefined || value === "") return null;

   switch (field) {
      case "data_saida":
         return formatNaiveDate(String(value)) || String(value);
      case "dt_dep":
      case "dt_arr":
         return formatEtapaDatetime(String(value));
      case "tvoo_etp":
      case "tvoo_alt":
         return minutesToTime(Number(value));
      case "status":
      case "tipo":
         return humanizeToken(String(value));
      // Função e posto vêm minúsculos do banco ("pil", "1t"): a tela inteira
      // (chips de tripulação, autor do log) fala em caixa alta.
      case "funcao":
      case "p_g":
         return String(value).toUpperCase();
      default:
         return String(value);
   }
}

// --- Descrições de item de lista ---

/** Etapa completa: "SBBR–SBGL (12/08/26 13:00Z)". */
export function describeEtapa(etapa: EtapaSnapshot): string {
   const rota = describeEtapaCurta(etapa);
   const quando = etapa.dt_dep ? formatEtapaDatetime(etapa.dt_dep) : "";
   return quando ? `${rota} (${quando})` : rota;
}

/**
 * Etapa sem horário, para rotular um item alterado: "SBBR–SBGL". Par
 * origem/destino usa meia-risca, não seta: no histórico a seta significa
 * "virou" (valor antigo → novo) e ter os dois papéis no mesmo cartão confunde.
 */
export function describeEtapaCurta(etapa: EtapaSnapshot): string {
   const rota = [etapa.origem, etapa.dest].filter(Boolean).join("–");
   return rota || "Etapa";
}

/** Tripulante completo: "1T DORNELES (PIL)". */
export function describeTripulante(trip: TripulanteSnapshot): string {
   const pessoa = describeTripulanteCurto(trip);
   return trip.funcao ? `${pessoa} (${trip.funcao.toUpperCase()})` : pessoa;
}

/** Tripulante sem função, para rotular um item alterado: "1T DORNELES". */
export function describeTripulanteCurto(trip: TripulanteSnapshot): string {
   const pessoa = [trip.p_g?.toUpperCase(), trip.nome]
      .filter(Boolean)
      .join(" ");
   return pessoa || `Tripulante ${trip.tripulante_id ?? "?"}`;
}

/** Ordem especial completa: "Missão: Transporte log.". */
export function describeCampoEspecial(campo: CampoEspecialSnapshot): string {
   const label = describeCampoEspecialCurto(campo);
   return campo.valor ? `${label}: ${campo.valor}` : label;
}

/** Só o rótulo da ordem especial, para item alterado. */
export function describeCampoEspecialCurto(
   campo: CampoEspecialSnapshot
): string {
   return campo.label || "Ordem especial";
}

/** "1 etapa" / "3 etapas" — resumo de criação/exclusão. */
export function pluralize(
   count: number,
   singular: string,
   plural: string
): string {
   return `${count} ${count === 1 ? singular : plural}`;
}
