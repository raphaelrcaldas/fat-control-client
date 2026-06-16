import { gerarRelatorio } from "utils/planilhaComiss";
import { gerarRelatorioDocx } from "utils/apostilaComiss";
import { ComissWithMiss } from "services/routes/cegep/comiss";

/** Dispara o download de um Blob com o nome informado. */
function downloadBlob(blob: Blob, filename: string) {
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   a.click();
   URL.revokeObjectURL(url);
}

/**
 * Encapsula a geração + download dos relatórios do comissionamento,
 * removendo a duplicação de `createObjectURL`/anchor/`revokeObjectURL`.
 */
export function useComissExport(comiss: ComissWithMiss) {
   const userName = `${comiss.user.posto.short}_${comiss.user.nome_guerra}`;

   const exportSheet = async () => {
      const blob = await gerarRelatorio(comiss);
      downloadBlob(blob, `comissionamento_${userName}.xlsx`);
   };

   const exportDocx = async () => {
      const blob = await gerarRelatorioDocx(comiss);
      downloadBlob(blob, `apostila_${userName}.docx`);
   };

   return { exportSheet, exportDocx };
}
