import { z } from "zod";

const baseAereaSchema = z
   .object({
      nome: z.string().trim(),
      sigla: z.string().trim(),
   })
   .nullable()
   .superRefine((val, ctx) => {
      if (val === null) return;
      const nomeEmpty = val.nome.length === 0;
      const siglaEmpty = val.sigla.length === 0;
      if (nomeEmpty !== siglaEmpty) {
         ctx.addIssue({
            code: "custom",
            message: "Preencha nome e sigla da base aérea ou deixe ambos vazios",
            path: nomeEmpty ? ["nome"] : ["sigla"],
         });
      }
   });

export const aerodromoSchema = z
   .object({
      nome: z.string().trim().min(1, "Nome é obrigatório"),
      codigo_icao: z
         .string()
         .trim()
         .length(4, "Código ICAO deve ter 4 caracteres")
         .regex(/^[A-Z]{4}$/, "Código ICAO deve conter apenas letras maiúsculas"),
      codigo_iata: z
         .string()
         .trim()
         .regex(/^[A-Z]{3}$/, "Código IATA deve ter 3 letras maiúsculas")
         .or(z.literal(""))
         .nullable()
         .optional()
         .transform((v) => (v ? v : null)),
      latitude: z
         .number({ message: "Latitude inválida" })
         .min(-90, "Latitude deve estar entre -90 e 90")
         .max(90, "Latitude deve estar entre -90 e 90"),
      longitude: z
         .number({ message: "Longitude inválida" })
         .min(-180, "Longitude deve estar entre -180 e 180")
         .max(180, "Longitude deve estar entre -180 e 180"),
      elevacao: z
         .number({ message: "Elevação inválida" })
         .int("Elevação deve ser inteira"),
      pais: z.string().trim().min(1, "País é obrigatório"),
      utc: z
         .number({ message: "UTC inválido" })
         .int("UTC deve ser inteiro")
         .min(-12, "UTC deve estar entre -12 e 14")
         .max(14, "UTC deve estar entre -12 e 14"),
      base_aerea: baseAereaSchema,
      codigo_cidade: z.number().int().nullable(),
      cidade_manual: z.string().trim().min(1).nullable(),
   })
   .superRefine((data, ctx) => {
      const isNacional = data.pais === "Brasil";
      if (isNacional && data.codigo_cidade === null) {
         ctx.addIssue({
            code: "custom",
            message: "Selecione a cidade",
            path: ["codigo_cidade"],
         });
      }
      if (!isNacional && !data.cidade_manual) {
         ctx.addIssue({
            code: "custom",
            message: "Cidade é obrigatória",
            path: ["cidade_manual"],
         });
      }
   })
   .transform((data) => ({
      ...data,
      base_aerea:
         data.base_aerea && data.base_aerea.nome && data.base_aerea.sigla
            ? data.base_aerea
            : null,
   }));

export type AerodromoFormValues = z.input<typeof aerodromoSchema>;
export type AerodromoFormOutput = z.output<typeof aerodromoSchema>;
