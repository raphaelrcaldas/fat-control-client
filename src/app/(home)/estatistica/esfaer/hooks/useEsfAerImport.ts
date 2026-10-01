import { useState } from "react";
import { useUpdateEsfAer } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { parseEsfAerData } from "../utils";
import {
   fieldErrorsFrom,
   humanizeValidationErrors,
} from "@/../utils/apiErrors";
import type { EsfAerImportRow, EsfAerParseError } from "../utils";
import type {
   EsfAerUpdateItem,
   EsfAerImportResponse,
} from "services/routes/estatistica/esfAer";

function toUpdateItems(rows: EsfAerImportRow[]): EsfAerUpdateItem[] {
   return rows.map((r) => ({
      tipo: r.tipo,
      modelo: r.modelo,
      grupo: r.grupo,
      programa: r.programa,
      subprograma: r.subprograma,
      aplicacao: r.aplicacao,
      horas_alocadas: r.horasAlocadas,
      meses_sagem: r.meses,
   }));
}

export function hasChanges(res: EsfAerImportResponse): boolean {
   return res.rows.length > 0;
}

/**
 * Orquestra o fluxo de importação de esforço aéreo: texto colado → parse →
 * confirmação → mutation → resultado. Concentra todo o estado e os handlers
 * não-visuais, deixando os componentes responsáveis apenas pela apresentação.
 */
export function useEsfAerImport(anoRef: number) {
   const [rawText, setRawTextValue] = useState("");
   const [parsedRows, setParsedRows] = useState<EsfAerImportRow[]>([]);
   const [errors, setErrors] = useState<EsfAerParseError[]>([]);
   const [showConfirm, setShowConfirm] = useState(false);
   const [importResult, setImportResult] =
      useState<EsfAerImportResponse | null>(null);

   const mutation = useUpdateEsfAer();
   const { push } = useToast();

   const setRawText = (value: string) => {
      setRawTextValue(value);
      setParsedRows([]);
      setErrors([]);
   };

   const reset = () => {
      setRawText("");
      setParsedRows([]);
      setErrors([]);
      setShowConfirm(false);
      setImportResult(null);
   };

   const parse = () => {
      const result = parseEsfAerData(rawText);
      setParsedRows(result.rows);
      setErrors(result.errors);
   };

   const confirmSend = async (): Promise<boolean> => {
      try {
         const result = await mutation.mutateAsync({
            ano_ref: anoRef,
            items: toUpdateItems(parsedRows),
         });
         setImportResult(result);
         setShowConfirm(false);
         setRawText("");
         setParsedRows([]);
         setErrors([]);
         if (hasChanges(result)) {
            push({
               message: `Importação concluída para ${anoRef}`,
               type: "success",
            });
         }
         return true;
      } catch (err: unknown) {
         const fieldErrors = fieldErrorsFrom(err);
         const sourceLineErrors = fieldErrors
            ? Object.fromEntries(
                 Object.entries(fieldErrors).map(([key, value]) => [
                    key.replace(
                       /(^|\.)items\.(\d+)(?=\.|$)/,
                       (match, prefix: string, index: string) => {
                          const row = parsedRows[Number(index)];
                          // O humanizador soma 1 ao índice para exibir a linha.
                          return row
                             ? `${prefix}items.${row.linha - 1}`
                             : match;
                       }
                    ),
                    value,
                 ])
              )
            : null;
         const message =
            err instanceof Error ? err.message : "Erro ao importar dados";
         const details = sourceLineErrors
            ? humanizeValidationErrors(sourceLineErrors, {
                 fields: {
                    items: "Linha",
                    horas_alocadas: "Alocadas",
                    meses_sagem: "Meses",
                    ano_ref: "Ano",
                 },
                 arrays: { items: "Linha" },
              })
            : [];
         push({
            message: [message, ...details.map((detail) => `• ${detail}`)].join(
               "\n"
            ),
            type: "error",
         });
         setShowConfirm(false);
         return false;
      }
   };

   return {
      rawText,
      setRawText,
      parsedRows,
      errors,
      showConfirm,
      setShowConfirm,
      importResult,
      setImportResult,
      isPending: mutation.isPending,
      reset,
      parse,
      confirmSend,
   };
}
