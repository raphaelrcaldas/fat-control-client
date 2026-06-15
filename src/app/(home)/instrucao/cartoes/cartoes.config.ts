import type { CartoesPublic } from "services/routes/instrucao/cartoes";

type Cartao = CartoesPublic | null | undefined;

export type CartaoFieldKind = "prova" | "lang";

export interface CartaoField {
   key: string;
   kind: CartaoFieldKind;
   /** Rótulo da badge colapsada (ex.: "CVI", "ESP A2"). */
   badgeLabel: (cartao: Cartao) => string;
   /** Rótulo curto da linha expandida (provas). */
   fieldLabel: string;
   validade: (cartao: Cartao) => string | null | undefined;
}

// Fonte única da lista de cartões — consumida pelas badges (colapsado) e pelas
// FieldRows de provas (expandido). Evita a duplicação que existia em 3 lugares.
export const CARTAO_FIELDS: CartaoField[] = [
   {
      key: "cvi",
      kind: "prova",
      badgeLabel: () => "CVI",
      fieldLabel: "CVI",
      validade: (c) => c?.cvi_validade,
   },
   {
      key: "ptai",
      kind: "prova",
      badgeLabel: () => "PTAI",
      fieldLabel: "PTAI",
      validade: (c) => c?.ptai_validade,
   },
   {
      key: "tai_s",
      kind: "prova",
      badgeLabel: () => "TAI S",
      fieldLabel: "TAI S",
      validade: (c) => c?.tai_s_validade,
   },
   {
      key: "tai_s1",
      kind: "prova",
      badgeLabel: () => "TAI S1",
      fieldLabel: "TAI S1",
      validade: (c) => c?.tai_s1_validade,
   },
   {
      key: "esp",
      kind: "lang",
      badgeLabel: (c) => `ESP ${c?.hab_espanhol ?? "—"}`,
      fieldLabel: "Espanhol",
      validade: (c) => c?.val_espanhol,
   },
   {
      key: "ing",
      kind: "lang",
      badgeLabel: (c) => `ING ${c?.hab_ingles ?? "—"}`,
      fieldLabel: "Inglês",
      validade: (c) => c?.val_ingles,
   },
];

export const PROVA_FIELDS = CARTAO_FIELDS.filter((f) => f.kind === "prova");

export interface LangField {
   key: string;
   lang: string;
   level: (cartao: Cartao) => string | null;
   validity: (cartao: Cartao) => string | null;
}

export const LANG_FIELDS: LangField[] = [
   {
      key: "esp",
      lang: "Espanhol",
      level: (c) => c?.hab_espanhol ?? null,
      validity: (c) => c?.val_espanhol ?? null,
   },
   {
      key: "ing",
      lang: "Inglês",
      level: (c) => c?.hab_ingles ?? null,
      validity: (c) => c?.val_ingles ?? null,
   },
];
