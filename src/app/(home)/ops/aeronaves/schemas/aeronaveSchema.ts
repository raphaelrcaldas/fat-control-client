import { z } from "zod";

export const SITUACOES = [
   { value: "DI", label: "Disponível" },
   { value: "DO", label: "Disponível c/ restrição" },
   { value: "IN", label: "Indisponível" },
   { value: "IS", label: "Inspeção" },
] as const;

export const aeronaveFormSchema = z.object({
   matricula: z
      .string()
      .length(4, "Matrícula deve ter 4 dígitos")
      .regex(/^\d{4}$/, "Matrícula deve conter apenas dígitos"),
   sit: z.string().length(2, "Selecione uma situação"),
   obs: z.string().nullable().optional(),
   prox_insp: z.string().nullable().optional(),
   active: z.boolean(),
});

export type AeronaveFormData = z.infer<typeof aeronaveFormSchema>;

export const defaultAeronaveValues: AeronaveFormData = {
   matricula: "",
   sit: "DI",
   obs: null,
   prox_insp: null,
   active: true,
};
