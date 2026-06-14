import { CrewQuadRes } from "services/routes/quads";
import { CrewMember } from "services/routes/trips";
import { isoStrToDate } from "utils/dateHandler";
import { compareByAntiguidade } from "utils/sortByAntiguidade";

export type QuadOrdem = "opr" | "mil";

/**
 * Timestamp da data operacional do tripulante. Sem `data_op` (null/ausente),
 * retorna 0 — equivalente ao comportamento anterior (`new Date(null)` = epoch),
 * jogando esses registros para o início da ordenação operacional.
 */
function dataOpTime(member: CrewMember): number {
   return member.func?.data_op
      ? isoStrToDate(member.func.data_op).getTime()
      : 0;
}

/**
 * Ordena a lista de quads por critério operacional (data de operação) ou
 * militar (antiguidade). Não muta o array recebido.
 */
export function sortQuads(
   quads: CrewQuadRes[],
   ordem: QuadOrdem
): CrewQuadRes[] {
   return [...quads].sort((a, b) => {
      if (ordem === "opr") {
         return dataOpTime(a.trip) - dataOpTime(b.trip);
      }
      return compareByAntiguidade(a.trip.user, b.trip.user);
   });
}
