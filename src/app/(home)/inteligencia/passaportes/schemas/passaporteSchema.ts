import { z } from "zod";

/**
 * Schema do formulário de passaporte (espelha o Pydantic PassaporteUpsert).
 * Campos controlados como string ("" = vazio). As regras cruzadas garantem
 * que a expedição não seja posterior à validade, em cada par de datas.
 */
export const passaporteFormSchema = z
   .object({
      passaporte: z.string(),
      data_expedicao_passaporte: z.string(),
      validade_passaporte: z.string(),
      visa: z.string(),
      data_expedicao_visa: z.string(),
      validade_visa: z.string(),
   })
   .refine(
      (d) =>
         !d.data_expedicao_passaporte ||
         !d.validade_passaporte ||
         d.data_expedicao_passaporte <= d.validade_passaporte,
      {
         message:
            "Data de expedição do passaporte não pode ser maior que a validade",
         path: ["data_expedicao_passaporte"],
      }
   )
   .refine(
      (d) =>
         !d.data_expedicao_visa ||
         !d.validade_visa ||
         d.data_expedicao_visa <= d.validade_visa,
      {
         message:
            "Data de expedição do visto não pode ser maior que a validade",
         path: ["data_expedicao_visa"],
      }
   );

export type PassaporteFormSchema = z.infer<typeof passaporteFormSchema>;
