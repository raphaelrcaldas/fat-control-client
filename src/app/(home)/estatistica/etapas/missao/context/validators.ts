import type { DraftEtapa, DraftHeavyCds, DraftPqd, DraftRevo } from "./types";

/**
 * Um item PQD e valido com quantidade preenchida e >= 0.
 * `qtd === 0` e lancamento em branco: procedimento executado, nada largado.
 */
export function isPqdValid(p: DraftPqd): boolean {
   return p.qtd != null && p.qtd >= 0;
}

/** Um item REVO so e valido com combustivel transferido preenchido e >= 1. */
export function isRevoValid(r: DraftRevo): boolean {
   return r.combTransf != null && r.combTransf >= 1;
}

/**
 * Um lancamento de carga precisa de peso preenchido e >= 0.
 *
 * `peso === 0` e lancamento em branco (procedimento executado, nada
 * largado): sem largada nao existe ponto de impacto, entao dist/radial
 * tem que estar zerados. Com peso real a exigencia do ponto de impacto
 * continua valendo — dist >= 1 e radial 0..359.
 */
export function isHeavyCdsValid(h: DraftHeavyCds): boolean {
   if (h.peso == null || h.peso < 0) return false;
   if (h.peso === 0) return h.dist === 0 && h.radial === 0;
   return (
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
