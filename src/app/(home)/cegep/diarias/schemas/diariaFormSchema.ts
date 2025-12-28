import { z } from "zod";

export const diariaFormSchema = z
   .object({
      valor: z
         .string()
         .min(1, "Valor obrigatório")
         .refine(
            (val) => {
               const num = parseFloat(val.replace(",", "."));
               return !isNaN(num) && num > 0;
            },
            { message: "Valor deve ser maior que zero" }
         ),
      data_inicio: z.string().min(1, "Data de início obrigatória"),
      data_fim: z.string().optional(),
      grupo_cid: z.number().min(1, "Selecione um grupo de cidade"),
      grupo_pg: z.number().min(1, "Selecione um grupo P/G"),
   })
   .refine(
      (data) => {
         if (!data.data_fim || data.data_fim === "") return true;
         return data.data_fim > data.data_inicio;
      },
      {
         message: "Data fim deve ser posterior à data início",
         path: ["data_fim"],
      }
   );

export type DiariaFormSchema = z.infer<typeof diariaFormSchema>;

export type DiariaFormErrors = Partial<Record<keyof DiariaFormSchema, string>>;
