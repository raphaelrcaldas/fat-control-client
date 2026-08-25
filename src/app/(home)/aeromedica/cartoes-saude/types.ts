import type { DateStatus } from "@/utils/dateStatus";

export type SortField = "militar" | "cemal" | "tovn" | "imae";
export type SortDirection = "asc" | "desc";
export type TripFilter = "all" | "trip" | "naoTrip";

/** Ordem de leitura dos status: o que exige ação primeiro. */
export const SEVERIDADES: DateStatus[] = [
   "expired",
   "critical",
   "warning",
   "valid",
   "empty",
];

/** Os três documentos do cartão, na ordem em que aparecem na tela. */
export const DOCS = ["cemal", "imae", "tovn"] as const;
export type DocKey = (typeof DOCS)[number];

/**
 * Recorte por validade. Vale sempre para UM documento (`doc`): o contador que
 * dispara o filtro é por documento, então filtrar pelo pior status do militar
 * devolveria um conjunto diferente do número clicado — "TOVN: sem data, 80"
 * listaria só quem não tem NENHUMA das três datas.
 *
 * `sem_ata` NÃO mora aqui: ata anexada é outro eixo (documento, não data), e
 * empilhar os dois no mesmo seletor era o que obrigava a lista de seis
 * opções a virar menu. Agora ele é um chip próprio na barra de filtros.
 */
export type ValidadeFilter =
   { tipo: "all" } | { tipo: "doc"; doc: DocKey; status: DateStatus };

export interface CartaoStats {
   /** Militares com a data preenchida. */
   total: number;
   /** Efetivo inteiro — `total` + os sem data; denominador das barras. */
   efetivo: number;
   counts: Record<DateStatus, number>;
}
