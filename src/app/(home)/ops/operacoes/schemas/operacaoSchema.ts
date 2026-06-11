import { z } from "zod";
import type { OperStatus, OperTipo } from "services/routes/ops/operacoes";

export const TIPOS: { value: OperTipo; label: string }[] = [
   { value: "operacao", label: "Operação" },
   { value: "manobra", label: "Manobra" },
   { value: "exercicio", label: "Exercício" },
];

export const STATUS: { value: OperStatus; label: string }[] = [
   { value: "planejada", label: "Planejada" },
   { value: "andamento", label: "Em andamento" },
   { value: "encerrada", label: "Encerrada" },
   { value: "cancelada", label: "Cancelada" },
];

export const FUNC_VALUES = ["Tripulante", "Apoio", "Manutenção"] as const;
// Situação financeira — códigos herdados do cegep (d/g/c).
export const SIT_VALUES = ["d", "g", "c"] as const;

export type FuncOption = (typeof FUNC_VALUES)[number];
export type SitOption = (typeof SIT_VALUES)[number];

export const operacaoFormSchema = z
   .object({
      nome: z
         .string()
         .trim()
         .min(1, "Informe o nome")
         .max(120, "Máximo de 120 caracteres"),
      tipo: z.enum(["operacao", "manobra", "exercicio"]),
      cidade_id: z
         .number({ error: "Selecione a cidade-sede" })
         .int()
         .positive("Selecione a cidade-sede"),
      data_inicio: z.string().min(1, "Informe a data de início"),
      data_fim: z.string().min(1, "Informe a data de término"),
      status: z.enum(["planejada", "andamento", "encerrada", "cancelada"]),
      documento_referencia: z
         .string()
         .max(100, "Máximo de 100 caracteres")
         .nullable(),
      obs: z.string().nullable(),
   })
   .refine((d) => d.data_fim >= d.data_inicio, {
      message: "O término deve ser igual ou posterior ao início",
      path: ["data_fim"],
   });

export type OperacaoFormData = z.infer<typeof operacaoFormSchema>;

export const pessoalFormSchema = z
   .object({
      user_id: z.number().int().positive("Selecione a pessoa"),
      func: z.enum(FUNC_VALUES, { error: "Selecione a função" }),
      sit: z.enum(SIT_VALUES, { error: "Selecione a situação" }),
      data_ingresso: z.string().min(1, "Informe a data de ingresso"),
      data_regresso: z.string().min(1, "Informe a data de regresso"),
   })
   .refine((d) => d.data_regresso >= d.data_ingresso, {
      message: "O regresso deve ser igual ou posterior ao ingresso",
      path: ["data_regresso"],
   });

export type PessoalFormData = z.infer<typeof pessoalFormSchema>;

export const defaultOperacaoValues: OperacaoFormData = {
   nome: "",
   tipo: "operacao",
   cidade_id: 0,
   data_inicio: "",
   data_fim: "",
   status: "planejada",
   documento_referencia: null,
   obs: null,
};
