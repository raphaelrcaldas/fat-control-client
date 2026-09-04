import { useState } from "react";
import { gerarRelatorio } from "utils/planilhaComiss";
import { gerarRelatorioDocx } from "utils/apostilaComiss";
import { downloadBlob } from "utils/downloadBlob";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { useToast } from "@/app/context/toast";

type ExportKind = "sheet" | "docx";

/**
 * Encapsula a geração + download dos relatórios do comissionamento,
 * removendo a duplicação de `createObjectURL`/anchor/`revokeObjectURL`.
 * Expõe `exporting` para desabilitar os botões e sinalizar progresso, além de
 * tratar falhas da geração com um toast (antes viravam rejeições silenciosas).
 */
export function useComissExport(comiss: ComissWithMiss) {
   const { push } = useToast();
   const [exporting, setExporting] = useState<ExportKind | null>(null);
   const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;

   const run = async (
      kind: ExportKind,
      gerar: (c: ComissWithMiss) => Promise<Blob>,
      filename: string
   ) => {
      if (exporting) return;
      setExporting(kind);
      try {
         const blob = await gerar(comiss);
         downloadBlob(blob, filename);
      } catch (err) {
         push({
            title: "Erro ao gerar arquivo",
            message:
               err instanceof Error
                  ? err.message
                  : "Não foi possível gerar o documento.",
            type: "error",
         });
      } finally {
         setExporting(null);
      }
   };

   const exportSheet = () =>
      run("sheet", gerarRelatorio, `comissionamento_${userName}.xlsx`);

   const exportDocx = () =>
      run("docx", gerarRelatorioDocx, `apostila_${userName}.docx`);

   return { exportSheet, exportDocx, exporting };
}
