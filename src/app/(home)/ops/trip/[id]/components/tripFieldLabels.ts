/**
 * Mapa de nomes de campo da API -> labels amigáveis do tripulante.
 * Fonte única usada na humanização dos erros de validação da API
 * (EditableTripField) e consumida pela aba Histórico para rotular os
 * campos alterados nos logs de auditoria.
 */
export const TRIP_FIELD_LABELS: Record<string, string> = {
   trig: "Trigrama",
   active: "Status",
   func: "Função",
   oper: "Operacionalidade",
   proj: "Projeto",
   data_op: "Data Operacional",
};
