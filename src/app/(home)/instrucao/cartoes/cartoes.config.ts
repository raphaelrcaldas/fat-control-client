import type { CartoesPublic } from "services/routes/instrucao/cartoes";

type Cartao = CartoesPublic | null | undefined;

// Fonte única das provas — consumida pelas badges e FieldRows do card
// (PilotCard) e pelos inputs de data do modal de edição. `key` é o prefixo do
// campo no schema: `${key}_validade`. A ordem aqui é a ordem canônica exibida
// em toda a feature (badges, linhas expandidas e formulário).
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

// Fonte única dos idiomas — consumida pelas badges (colapsado) e pelos
// LangCards (expandido). `abbr` compõe o rótulo curto da badge (ex.: "ESP A2").
export interface LangField {
   key: string;
   lang: string;
   abbr: string;
   level: (cartao: Cartao) => string | null;
   validity: (cartao: Cartao) => string | null;
}

export const LANG_FIELDS: LangField[] = [
   {
      key: "esp",
      lang: "Espanhol",
      abbr: "ESP",
      level: (c) => c?.hab_espanhol ?? null,
      validity: (c) => c?.val_espanhol ?? null,
   },
   {
      key: "ing",
      lang: "Inglês",
      abbr: "ING",
      level: (c) => c?.hab_ingles ?? null,
      validity: (c) => c?.val_ingles ?? null,
   },
];
