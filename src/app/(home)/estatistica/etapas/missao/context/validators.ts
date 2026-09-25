import type {
   DraftEtapa,
   DraftHeavyCds,
   DraftPqd,
   DraftRevo,
   EtapaFormData,
} from "./types";

/**
 * Janela plausivel para a data da etapa, espelhando o guard do backend
 * (`ETAPA_ANO_MIN` em `schemas/estatistica/etapa.py`). O piso acompanha o
 * resto da estatistica, que trata 2020 como inicio; o teto deixa um ano de
 * folga para planejamento.
 *
 * Sem isto o campo aceita qualquer ano de 4 digitos — um deslize de
 * digitacao ja gravou etapa no ano 0006, que some dos paineis (filtram
 * `ano >= 2020`) mas continua na listagem por janela de data.
 */
export const DATA_MIN = "2020-01-01";
export const DATA_MAX = `${new Date().getFullYear() + 1}-12-31`;

/**
 * Envelopes operacionais, mais restritos que os limites duros do banco (que
 * funcionam como rede de seguranca). Fonte unica: alimenta os erros de
 * `deriveFormErrors`, que travam o salvar, e os atributos min/max dos inputs.
 */
export const FIELD_LIMITS = {
   pousos: { min: 0, max: 20 },
   tow: { min: 52000, max: 87000 },
   pax: { min: 0, max: 84 },
   carga: { min: 0, max: 30000 },
   comb: { min: 1, max: 32767 },
   lub: { min: 0, max: 99.9 },
} as const;

type LimitKey = keyof typeof FIELD_LIMITS;

/** Erro por campo do formulario; `tvoo` e o tempo calculado de dep/arr. */
export type FormErrors = Partial<Record<keyof EtapaFormData | "tvoo", string>>;

/**
 * Erros de valor preenchido: aparecem enquanto se digita e deixam a etapa em
 * "verificar". Campo vazio nao entra aqui (ver `requiredFormErrors`).
 */
export function deriveFormErrors(
   form: EtapaFormData,
   tvoo: number
): FormErrors {
   const errs: FormErrors = {};

   if (form.data && (form.data < DATA_MIN || form.data > DATA_MAX)) {
      errs.data = `Ano entre ${DATA_MIN.slice(0, 4)} e ${DATA_MAX.slice(0, 4)}.`;
   }

   if (form.dep && form.arr) {
      if (form.dep === form.arr) {
         errs.arr = "Igual à decolagem.";
      } else if (tvoo === 0) {
         errs.arr = "Atravessa o dia (use 00:00).";
      } else if (tvoo % 5 !== 0) {
         errs.tvoo = "Múltiplo de 5 min.";
      }
   }

   for (const key of Object.keys(FIELD_LIMITS) as LimitKey[]) {
      const val = form[key];
      if (val == null) continue;
      const num = Number(val);
      if (Number.isNaN(num)) continue;
      // o rotulo do campo ja diz qual e; a mensagem cabe numa linha
      const { min, max } = FIELD_LIMITS[key];
      if (num < min) errs[key] = `Mínimo ${min.toLocaleString("pt-BR")}.`;
      else if (num > max) errs[key] = `Máximo ${max.toLocaleString("pt-BR")}.`;
   }

   return errs;
}

/**
 * Campos obrigatorios vazios. Separado de `deriveFormErrors` porque so e
 * exibido depois de um salvar recusado — a etapa recem-criada nao nasce
 * gritando.
 */
export function requiredFormErrors(form: EtapaFormData): FormErrors {
   const errs: FormErrors = {};
   if (!form.data) errs.data = "Obrigatório.";
   if (!form.anv) errs.anv = "Obrigatório.";
   for (const key of ["origem", "destino"] as const) {
      if (!form[key]) errs[key] = "Obrigatório.";
      else if (form[key].length < 4) errs[key] = "4 letras (ICAO).";
   }
   if (!form.dep) errs.dep = "Obrigatório.";
   if (!form.arr) errs.arr = "Obrigatório.";
   return errs;
}

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
