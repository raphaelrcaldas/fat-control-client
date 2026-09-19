import { formatSaveError, type ApiErrorLabels } from "@/../utils/apiErrors";

/** Rótulos do contrato de validação de localidades especiais. */
const LABELS: ApiErrorLabels = {
   fields: {
      cidade_id: "Município",
      grupo: "Grupo",
      fuso: "Fuso horário",
      icaos: "Aeródromos (ICAO)",
   },
   arrays: {
      icaos: "ICAO",
   },
};

/** Converte uma falha da mutation em texto legível para o toast. */
export function formatLocalidadeError(err: unknown, fallback: string): string {
   return formatSaveError(err, fallback, LABELS);
}
