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
