import { useState, useCallback } from "react";
import type { OrdemMissaoOut } from "services/routes/om/ordens";
import { gerarOrdemMissaoDocx } from "../../../utils/exportOrdemMissao";
import { gerarPedidoLanche } from "../../../utils/exportLanche";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";

// Dispara o download de um blob e revoga a URL após o download iniciar
// (revogar de imediato pode cancelar o download em alguns browsers)
function downloadBlob(blob: Blob, fileName: string) {
   const blobUrl = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = blobUrl;
   a.download = fileName;
   a.click();
   setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

// Exportações da OM (documento DOCX e pedido de lanche), com os estados de
// loading e a validação prévia de cada geração
export function useOrdemExports(ordem: OrdemMissaoOut | null) {
   const { push: pushToast } = useToast();
   const { activeOrg } = useAuth();

   const [isExporting, setIsExporting] = useState(false);
   const [isGeneratingLanche, setIsGeneratingLanche] = useState(false);

   const handleExportDocx = useCallback(async () => {
      if (!ordem) return;

      // Validação básica de campos obrigatórios
      if (
         !ordem.id ||
         !Array.isArray(ordem.etapas) ||
         ordem.etapas.length === 0
      ) {
         pushToast({
            type: "warning",
            title: "Atenção",
            message:
               "Ordem de Missão incompleta. Adicione pelo menos uma etapa antes de exportar.",
         });
         return;
      }

      setIsExporting(true);

      try {
         const blob = await gerarOrdemMissaoDocx(ordem, activeOrg ?? "");
         downloadBlob(blob, `OM_${ordem.numero}_${activeOrg ?? ""}.docx`);
      } catch (error) {
         console.error("Erro ao exportar Ordem de Missão:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message:
               "Erro ao gerar documento DOCX. Por favor, tente novamente.",
         });
      } finally {
         setIsExporting(false);
      }
   }, [ordem, activeOrg, pushToast]);

   const handlePedidoLanche = useCallback(async () => {
      if (!ordem) return;

      // Validação básica
      if (!ordem.id) {
         pushToast({
            type: "warning",
            title: "Atenção",
            message: "Salve a ordem antes de gerar o pedido de lanche.",
         });
         return;
      }

      setIsGeneratingLanche(true);

      try {
         const blob = await gerarPedidoLanche(ordem);
         downloadBlob(blob, `lanche_${ordem.numero}_${activeOrg ?? ""}.docx`);
      } catch (error) {
         console.error("Erro ao gerar pedido de lanche:", error);
         pushToast({
            type: "error",
            title: "Erro",
            message:
               "Erro ao gerar pedido de lanche. Por favor, tente novamente.",
         });
      } finally {
         setIsGeneratingLanche(false);
      }
   }, [ordem, activeOrg, pushToast]);

   return {
      isExporting,
      isGeneratingLanche,
      handleExportDocx,
      handlePedidoLanche,
   };
}
