import { z } from "zod";
import { todayIso } from "@/../utils/dateHandler";

export const soldoFormSchema = z
   .object({
      pg: z.string().min(1, "Selecione um posto/graduacao"),
      data_inicio: z.string().min(1, "Data de inicio obrigatoria"),
      data_fim: z.string().nullable().optional(),
      // O input é `type="number"` com `valueAsNumber`, então apagar o campo
      // entrega NaN — não "". Sem a mensagem de tipo, o Zod devolveria o
      // texto padrão em inglês ("Invalid input: expected number, received
      // NaN") direto na tela.
      valor: z
         .number({ message: "Informe o valor do soldo" })
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

/**
 * Valores iniciais do formulário. É uma factory (não constante de módulo) para
 * que `data_inicio` use a data de hoje no fuso local no momento do reset, em vez
 * de congelar no carregamento do bundle. Data via dateHandler (sem off-by-one).
 */
export function makeDefaultSoldoValues(): SoldoFormData {
   return {
      pg: "",
      data_inicio: todayIso(),
      data_fim: null,
      valor: 0,
   };
}
