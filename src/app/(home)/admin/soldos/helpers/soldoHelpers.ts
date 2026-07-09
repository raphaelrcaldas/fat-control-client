import { daysUntil } from "@/../utils/dateHandler";
import { postoGradRecords, CIRCULO_LABELS } from "services/routes/postos";
import { SoldoPublic } from "services/routes/admin/soldos";

export type SoldoStatus = "vigente" | "proximo" | "anterior";

const getPostoInfo = (pg: string) =>
   postoGradRecords.find((p) => p.short === pg);

/** Resolve o círculo do soldo (relacionamento do backend ou fallback estático). */
export function resolveCirculo(soldo: SoldoPublic): string | undefined {
   return soldo.posto_grad?.circulo || getPostoInfo(soldo.pg)?.circulo;
}

/** Resolve o nome médio do posto/graduação, com fallback para a sigla. */
export function resolveMid(soldo: SoldoPublic): string {
   return soldo.posto_grad?.mid || getPostoInfo(soldo.pg)?.mid || soldo.pg;
}

/** Rótulo legível do círculo (ex.: "Oficiais Generais"). */
export function resolveCirculoLabel(soldo: SoldoPublic): string {
   return CIRCULO_LABELS[resolveCirculo(soldo) || ""] || "-";
}

/** Mapa círculo → cor do Badge Flowbite. */
const CIRCULO_BADGE_COLOR: Record<string, string> = {
   praca: "gray",
   grad: "indigo",
   of_sub: "success",
   of_int: "warning",
   of_sup: "info",
   of_gen: "failure",
};

export function getCirculoColor(circulo: string | undefined): string {
   return (circulo && CIRCULO_BADGE_COLOR[circulo]) || "gray";
}

export function formatCurrency(value: number): string {
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(value);
}

/**
 * Classifica a vigência do soldo comparando apenas o dia (via dateHandler,
 * imune a fuso). `proximo` = início no futuro; `anterior` = fim no passado.
 */
export function getSoldoStatus(
   dataInicio: string,
   dataFim: string | null
): SoldoStatus {
   if (daysUntil(dataInicio) > 0) return "proximo";
   if (dataFim && daysUntil(dataFim) < 0) return "anterior";
   return "vigente";
}

/** Ordena por antiguidade do posto/graduação (ascendente). */
export function sortSoldosByAnt(soldos: SoldoPublic[]): SoldoPublic[] {
   return [...soldos].sort(
      (a, b) => (a.posto_grad?.ant || 0) - (b.posto_grad?.ant || 0)
   );
}

/** Opções de filtro por círculo derivadas dos postos cadastrados. */
export const CIRCULO_OPTIONS: { value: string; label: string }[] = [
   { value: "", label: "Todos" },
   ...Array.from(new Set(postoGradRecords.map((p) => p.circulo))).map(
      (circulo) => ({
         value: circulo,
         label: CIRCULO_LABELS[circulo] || circulo,
      })
   ),
];
