import { useState, useCallback } from "react";
import type { OrdemMissaoOut } from "services/routes/om/ordens";
import { gerarOrdemMissaoDocx } from "../../../utils/exportOrdemMissao";
import { gerarPedidoLanche } from "../../../utils/exportLanche";
import { useAuth } from "@/app/context/auth";
import { useToast } from "@/app/context/toast";
import { brasaoUrl } from "@/lib/orgBrasao";
import { CARGOS, getCargos, linhaAssinatura } from "services/routes/config";

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
   const { activeOrg, orgs } = useAuth();

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

      // O cabeçalho herda o brasão da org ativa — sem brasão registrado
      // (public/brasoes + orgBrasao.ts) o documento sairia errado
      if (!brasaoUrl(activeOrg)) {
         pushToast({
            type: "warning",
            title: "Atenção",
            message:
               "A organização ativa não possui brasão registrado. Não é possível exportar a Ordem de Missão.",
         });
         return;
      }

      setIsExporting(true);

      try {
         // O rodapé é assinado pelo comandante e pelo chefe de operações da
         // org. Sem os dois titulares — ou com titular sem nome completo, que
         // é o que sai impresso — o documento sairia defeituoso. Mesma postura
         // do brasão: bloquear em vez de gerar errado.
         const cargos = await getCargos();
         const invalidos = CARGOS.filter((c) => {
            const titular = cargos.find((cargo) => cargo.cargo === c);
            return !titular || linhaAssinatura(titular) === null;
         });
         if (invalidos.length > 0) {
            pushToast({
               type: "warning",
               title: "Atenção",
               message:
                  "A organização ativa não tem os titulares de comandante e chefe de operações definidos, com nome completo cadastrado. Ajuste em Configurações antes de exportar.",
            });
            return;
         }

         const org = orgs.find((o) => o.organizacao_id === activeOrg);
         const blob = await gerarOrdemMissaoDocx(
            ordem,
            activeOrg ?? "",
            org?.nome ?? activeOrg ?? "",
            cargos
         );
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
   }, [ordem, activeOrg, orgs, pushToast]);

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
