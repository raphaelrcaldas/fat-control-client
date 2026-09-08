import { z } from "zod";

/** Espelha `RestricaoDerivada` da API. Itens desta lista são somente leitura. */
export const RestricaoDerivadaSchema = z.object({
   origem: z.enum(["cemal", "recencia_voo"]),
   codigo: z.enum(["cemal_ausente", "cemal_vencido", "desadaptacao"]),
   inicio: z.iso.date().nullable(),
   fim: z.iso.date().nullable(),
   efeito: z.enum(["bloqueio", "aviso"]),
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
