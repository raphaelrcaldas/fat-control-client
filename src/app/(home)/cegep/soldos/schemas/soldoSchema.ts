import { z } from "zod";

export const soldoFormSchema = z
   .object({
      pg: z.string().min(1, "Selecione um posto/graduacao"),
      data_inicio: z.string().min(1, "Data de inicio obrigatoria"),
      data_fim: z.string().nullable().optional(),
      valor: z
         .number({ coerce: true })
         .positive("Valor deve ser maior que zero"),
   })
   .refine(
      (data) => {
         if (!data.data_fim) return true;
         return data.data_fim > data.data_inicio;
      },
      {
         message: "Data fim deve ser maior que data inicio",
         path: ["data_fim"],
      }
   );

export type SoldoFormData = z.infer<typeof soldoFormSchema>;

export const defaultSoldoValues: SoldoFormData = {
   pg: "",
   data_inicio: new Date().toISOString().split("T")[0],
   data_fim: null,
   valor: 0,
};
