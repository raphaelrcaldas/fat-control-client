import { z } from "zod";

/** Espelha `RestricaoDerivada` da API. Itens desta lista são somente leitura. */
export const RestricaoDerivadaSchema = z.object({
   origem: z.enum(["cemal", "recencia_voo", "operacao"]),
   codigo: z.enum([
      "cemal_ausente",
      "cemal_vencido",
      "desadaptacao",
      "operacao",
   ]),
   inicio: z.iso.date().nullable(),
   fim: z.iso.date().nullable(),
   efeito: z.enum(["bloqueio", "aviso"]),
   /**
    * Só a restrição de operação preenche: o nome da operação e o seu id.
    * `nullish` e não `nullable().default()` — os endpoints que ainda não
    * mandam o campo continuam válidos, e o objeto parseado traz `undefined`
    * em vez de obrigar todo mock de teste a citar os dois campos.
    */
   rotulo: z.string().nullish(),
   operacao_id: z.number().int().nullish(),
});

export type RestricaoDerivada = z.infer<typeof RestricaoDerivadaSchema>;

/**
 * Valida o campo aditivo sem duplicar os schemas legados dos endpoints.
 * A ausência é erro de contrato: nunca vira uma lista vazia que liberaria a UI.
 */
export const RestricoesDerivadasEntrySchema = z.object({
   restricoes_derivadas: z.array(RestricaoDerivadaSchema),
   elegivel_desadaptacao: z.boolean(),
});
