import type { CartoesPublic } from "services/routes/instrucao/cartoes";
import { CARD_WARN_DAYS } from "utils/cardValidity";
import type { CartaoStatus } from "./types";

type Cartao = CartoesPublic | null | undefined;

// Fonte única das provas — consumida pelas badges e FieldRows do card
// (PilotCard), pelos inputs de data do modal de edição e pelo resumo. `key` é
// o prefixo do campo no schema: `${key}_validade`. A ordem aqui é a ordem
// canônica exibida em toda a feature (badges, linhas expandidas e formulário).
export interface ProvaField {
   key: string;
   label: string;
   validade: (cartao: Cartao) => string | null;
}

export const PROVA_FIELDS: ProvaField[] = [
   { key: "ptai", label: "PTAI", validade: (c) => c?.ptai_validade ?? null },
   { key: "tai_s", label: "TAI S", validade: (c) => c?.tai_s_validade ?? null },
   {
      key: "tai_s1",
      label: "TAI S1",
      validade: (c) => c?.tai_s1_validade ?? null,
   },
   { key: "cvi", label: "CVI", validade: (c) => c?.cvi_validade ?? null },
];

// Fonte única dos idiomas — consumida pelas badges (colapsado), pelos
// LangCards (expandido), pelo formulário e pelo resumo. `abbr` compõe o rótulo
// curto da badge (ex.: "ESP A2"); `levelName`/`validadeName` são os campos do
// schema que o formulário edita.
export interface LangField {
   key: string;
   lang: string;
   abbr: string;
   levelName: "hab_espanhol" | "hab_ingles";
   validadeName: "val_espanhol" | "val_ingles";
   level: (cartao: Cartao) => string | null;
   validity: (cartao: Cartao) => string | null;
}

export const LANG_FIELDS: LangField[] = [
   {
      key: "esp",
      lang: "Espanhol",
      abbr: "ESP",
      levelName: "hab_espanhol",
      validadeName: "val_espanhol",
      level: (c) => c?.hab_espanhol ?? null,
      validity: (c) => c?.val_espanhol ?? null,
   },
   {
      key: "ing",
      lang: "Inglês",
      abbr: "ING",
      levelName: "hab_ingles",
      validadeName: "val_ingles",
      level: (c) => c?.hab_ingles ?? null,
      validity: (c) => c?.val_ingles ?? null,
   },
];

// Tudo o que tem validade, na ordem canônica: cada item vira uma faixa do
// resumo e um recorte possível da lista (`?doc=<key>&status=<status>`).
export interface DocField {
   key: string;
   /** Sigla curta, igual à das badges do card (PTAI, ESP…). */
   label: string;
   /** Nome por extenso, para `title` e nome acessível. */
   nome: string;
   validade: (cartao: Cartao) => string | null;
}

export const DOC_FIELDS: DocField[] = [
   ...PROVA_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      nome: f.label,
      validade: f.validade,
   })),
   ...LANG_FIELDS.map((f) => ({
      key: f.key,
      label: f.abbr,
      nome: f.lang,
      validade: f.validity,
   })),
];

/** Ordem de leitura dos status: o que exige ação primeiro. */
export const SEVERIDADES: CartaoStatus[] = ["danger", "warn", "ok", "empty"];

/** Rótulo curto de cada status — contador do resumo e anúncio do filtro. */
export const STATUS_LABELS: Record<CartaoStatus, string> = {
   danger: "Vencido",
   warn: "A vencer",
   ok: "Regular",
   empty: "Sem data",
};

/** O que "A vencer" quer dizer — o limiar vem da regra única de validade. */
export const CARD_WARN_DAYS_LABEL = `vence em até ${CARD_WARN_DAYS} dias`;
