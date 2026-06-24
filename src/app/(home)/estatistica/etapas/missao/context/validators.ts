import type { DraftEtapa, DraftHeavyCds, DraftPqd, DraftRevo } from "./types";

/** Um item PQD e valido com quantidade preenchida e >= 0 (0 = passagem em branco). */
export function isPqdValid(p: DraftPqd): boolean {
   return p.qtd != null && p.qtd >= 0;
}

/** Um item REVO so e valido com combustivel transferido preenchido e >= 1. */
export function isRevoValid(r: DraftRevo): boolean {
   return r.combTransf != null && r.combTransf >= 1;
}

/** Um lancamento de carga so e valido com peso/dist >= 1 e radial 0..359. */
export function isHeavyCdsValid(h: DraftHeavyCds): boolean {
   return (
      h.peso != null &&
      h.peso >= 1 &&
      h.dist != null &&
      h.dist >= 1 &&
      h.radial != null &&
      h.radial >= 0 &&
      h.radial <= 359
   );
}

/** Todos os especificos da etapa preenchidos (arrays vazios sao validos). */
export function selectEspecificosValid(etapa: DraftEtapa): boolean {
   return (
      etapa.pqd.every(isPqdValid) &&
      etapa.revo.every(isRevoValid) &&
      etapa.heavyCds.every(isHeavyCdsValid)
   );
}
