import { Button } from "flowbite-react";
import { LineNumberedTextarea } from "./LineNumberedTextarea";
import { ImportPreviewTable } from "./ImportPreviewTable";
import type { EsfAerImportRow, EsfAerParseError } from "../../utils";

interface ImportInputPanelProps {
   rawText: string;
   onRawTextChange: (value: string) => void;
   parsedRows: EsfAerImportRow[];
   errors: EsfAerParseError[];
   onParse: () => void;
   onSend: () => void;
}

export function ImportInputPanel({
   rawText,
   onRawTextChange,
   parsedRows,
   errors,
   onParse,
   onSend,
}: ImportInputPanelProps) {
   return (
      <div className="space-y-4">
         <LineNumberedTextarea
            value={rawText}
            onChange={onRawTextChange}
            placeholder="Cole aqui os dados copiados da tabela (separados por TAB)..."
         />

         <div className="flex gap-2">
            <Button color="red" onClick={onParse} disabled={!rawText.trim()}>
               Parsear Dados
            </Button>
            {parsedRows.length > 0 && errors.length === 0 && (
               <Button color="green" onClick={onSend}>
                  Enviar
               </Button>
            )}
            {parsedRows.length > 0 && (
               <span className="self-center text-sm text-gray-500">
                  {parsedRows.length} linha(s) importada(s)
               </span>
            )}
         </div>

         {errors.length > 0 && (
            <div className="rounded border border-red-300 bg-red-50 p-3">
               <p className="mb-2 text-sm font-semibold text-red-700">
                  {errors.length} linha(s) com erro - corrija os dados e tente
                  novamente:
               </p>
               <ul className="space-y-1">
                  {errors.map((err) => (
                     <li key={err.linha} className="text-xs text-red-600">
                        <span className="font-medium">Linha {err.linha}:</span>{" "}
                        {err.motivo}
                        <span className="ml-1 text-red-400">
                           ({err.conteudo}...)
                        </span>
                     </li>
                  ))}
               </ul>
            </div>
         )}

         {parsedRows.length > 0 && <ImportPreviewTable rows={parsedRows} />}
      </div>
   );
}
