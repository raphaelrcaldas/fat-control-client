import { z } from "zod";
import type { ElementType } from "react";
import { MdCheckCircle, MdWarning, MdCancel, MdBuild } from "react-icons/md";

/**
 * Fonte única do domínio "situação da aeronave": valor, rótulos, ícone e
 * classes. Antes isto vivia espalhado em 5 arquivos (schema, tabela, card,
 * resumo e modal), já divergindo em rótulo e em tom de cor.
 *
 * - `badge`: chip que carrega texto (tabela/card) — tinta clara + texto
 *   escuro. Branco sobre `*-400/-500` reprovava AA (1,9:1 a 2,7:1).
 * - `accent`: barra decorativa (`aria-hidden`) do resumo — sem texto por
 *   cima, cor sólida.
 */
export const SITUACOES = [
   {
      value: "DI",
      label: "Disponível",
      labelPlural: "Disponíveis",
      icon: MdCheckCircle,
      badge: "bg-emerald-100 text-emerald-800",
      accent: "bg-emerald-500",
      iconColor: "text-emerald-600",
      ring: "ring-emerald-600",
      selected: "border-emerald-500 bg-emerald-50",
   },
   {
      value: "DO",
      label: "Disponível c/ restrição",
      labelPlural: "C/ Restrição",
      icon: MdWarning,
      badge: "bg-orange-100 text-orange-800",
      accent: "bg-orange-500",
      iconColor: "text-orange-600",
      ring: "ring-orange-600",
      selected: "border-orange-500 bg-orange-50",
   },
   {
      value: "IN",
      label: "Indisponível",
      labelPlural: "Indisponíveis",
      icon: MdCancel,
      badge: "bg-red-100 text-red-800",
      accent: "bg-red-500",
      iconColor: "text-red-600",
      ring: "ring-red-600",
      selected: "border-red-500 bg-red-50",
   },
   {
      value: "IS",
      label: "Inspeção",
      labelPlural: "Em Inspeção",
      icon: MdBuild,
      badge: "bg-slate-100 text-slate-700",
      accent: "bg-slate-400",
      iconColor: "text-slate-600",
      ring: "ring-slate-500",
      selected: "border-slate-400 bg-slate-50",
   },
] as const;

export type SituacaoValue = (typeof SITUACOES)[number]["value"];

export interface SituacaoMeta {
   value: SituacaoValue;
   label: string;
   labelPlural: string;
   icon: ElementType;
   badge: string;
   accent: string;
   iconColor: string;
   ring: string;
   selected: string;
}

const SITUACAO_FALLBACK: SituacaoMeta = {
   value: "IS",
   label: "—",
   labelPlural: "—",
   icon: MdBuild,
   badge: "bg-slate-100 text-slate-700",
   accent: "bg-slate-400",
   iconColor: "text-slate-600",
   ring: "ring-slate-500",
   selected: "border-slate-400 bg-slate-50",
};

/**
 * Situação vem do backend como `string` livre (sem enum no Pydantic), então
 * um valor fora da lista é possível — cai no fallback neutro em vez de
 * renderizar chip sem cor nenhuma.
 */
export function situacaoMeta(sit: string): SituacaoMeta {
   return (
      (SITUACOES.find((s) => s.value === sit) as SituacaoMeta | undefined) ??
      SITUACAO_FALLBACK
   );
}

const SITUACAO_VALUES = SITUACOES.map((s) => s.value) as [
   SituacaoValue,
   ...SituacaoValue[],
];

export const aeronaveFormSchema = z.object({
   matricula: z
      .string()
      .length(4, "Matrícula deve ter 4 dígitos")
      .regex(/^\d{4}$/, "Matrícula deve conter apenas dígitos"),
   sit: z.enum(SITUACAO_VALUES, "Selecione uma situação"),
   obs: z.string().nullable().optional(),
   active: z.boolean(),
   is_sim: z.boolean(),
   projeto: z.string().length(2, "Selecione um projeto"),
});

export type AeronaveFormData = z.infer<typeof aeronaveFormSchema>;

export const defaultAeronaveValues: AeronaveFormData = {
   matricula: "",
   sit: "DI",
   obs: null,
   active: true,
   is_sim: false,
   projeto: "",
};
