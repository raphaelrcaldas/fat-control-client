import { z } from "zod";

/**
 * Schema do formulário de CRM (espelha o Pydantic CrmUpsert). Campos
 * controlados como string ("" = vazio). A regra cruzada garante que a
 * realização não seja posterior à validade.
 */
export const crmFormSchema = z
   .object({
      data_realizacao: z.string(),
      data_validade: z.string(),
   })
   .refine(
      (d) =>
         !d.data_realizacao ||
         !d.data_validade ||
         d.data_realizacao <= d.data_validade,
      {
         message: "A data de realização não pode ser maior que a de validade.",
         path: ["data_realizacao"],
      }
   );

export type CrmFormSchema = z.infer<typeof crmFormSchema>;
