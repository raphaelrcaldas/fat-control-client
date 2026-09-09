/**
 * Motivos de indisponibilidade de tripulantes.
 *
 * O nome é `IndispMtv`, e não `IndispType`, porque `IndispType` já é o REGISTRO
 * em `services/routes/indisps.ts`. Os dois conviviam no escopo da mesma feature
 * e só não colidiram por sorte.
 */
export type IndispMtv =
   "svc" | "sde" | "rep" | "fer" | "lic" | "mis" | "odm" | "pes" | "ins";

export interface IndispOption {
   value: IndispMtv;
   label: string;
   /**
    * FONTE ÚNICA da cor do motivo: fundo claro + texto escuro. A grade, a
    * lista do tripulante e o painel de últimas atualizações leem daqui — antes
    * havia três tons para o mesmo motivo (`-100` na faixa, `-200` na pastilha)
    * lado a lado na mesma tela, o que desfazia o índice que a cor deveria ser.
    */
   bar: string;
   /** O escalante não altera este motivo — a faixa ganha cadeado. */
   locked: boolean;
}

/**
 * O VERMELHO É SEMÂNTICO, não decorativo: motivos em vermelho são as
 * indisponibilidades que o escalante NÃO pode alterar (`locked`) — Saúde,
 * Representação, Férias, Licença e CEMAL. Compartilharem o mesmo matiz é
 * intencional; NÃO dar um vermelho distinto a cada um, isso apagaria o sinal.
 *
 * Na grade de faixas o sinal deixou de depender só da cor: a faixa carrega o
 * cadeado (`locked`) e o rótulo do motivo, então o vermelho vira reforço em
 * vez de ser a única informação. Foi o que dispensou a legenda de 12 cores,
 * que prometia uma bijeção cor→motivo que nunca existiu.
 */

export const INDISP_OPTIONS: IndispOption[] = [
   {
      value: "svc",
      label: "Serviço",
      bar: "bg-amber-100 text-amber-800",
      locked: false,
   },
   {
      value: "sde",
      label: "Saúde",
      bar: "bg-red-100 text-red-800",
      locked: true,
   },
   {
      value: "rep",
      label: "Representação",
      bar: "bg-red-100 text-red-800",
      locked: true,
   },
   {
      value: "fer",
      label: "Férias",
      bar: "bg-red-100 text-red-800",
      locked: true,
   },
   {
      value: "lic",
      label: "Licença",
      bar: "bg-red-100 text-red-800",
      locked: true,
   },
   {
      value: "mis",
      label: "Missão",
      bar: "bg-orange-100 text-orange-800",
      locked: false,
   },
   {
      value: "odm",
      label: "Ordem de Missão",
      bar: "bg-rose-100 text-rose-800",
      locked: false,
   },
   {
      value: "pes",
      label: "Particular",
      bar: "bg-blue-100 text-blue-800",
      locked: false,
   },
   {
      value: "ins",
      label: "CEMAL",
      bar: "bg-red-100 text-red-800",
      locked: true,
   },
];

/**
 * Busca uma opção de indisponibilidade pelo valor
 */
export function getIndispOption(mtv: string): IndispOption | undefined {
   return INDISP_OPTIONS.find((item) => item.value === mtv);
}

/**
 * Estados DERIVADOS que a grade desenha como faixa junto com os motivos.
 * Não são registros de indisponibilidade: saem do CEMAL e da data do último
 * voo do tripulante, e por isso não têm `id` nem se editam pelo formulário.
 * Aparecem como faixa (e não como marca na coluna do trigrama) porque começam
 * num dia exato — ver a faixa começar é ver o dia em que o tripulante cai.
 */
export const DERIVED_BARS = {
   cemal_ausente: {
      code: "CEM",
      label: "CEMAL ausente",
      bar: "bg-purple-100 text-purple-800",
   },
   cemal_vencido: {
      code: "CEM",
      label: "CEMAL vencido",
      bar: "bg-purple-100 text-purple-800",
   },
   desadaptacao: {
      code: "DSP",
      label: "Desadaptado",
      bar: "bg-slate-100 text-slate-800",
   },
} as const;
