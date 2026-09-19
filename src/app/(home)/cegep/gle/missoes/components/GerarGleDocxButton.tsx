"use client";

import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiDocumentDownload } from "react-icons/hi";

import { useToast } from "@/app/context/toast";
import { downloadBlob } from "utils/downloadBlob";
import type { MissaoGle } from "services/routes/cegep/gleMissoes";

import { gerarDocumentoGleDocx } from "../utils/exportGleDocx";

interface GerarGleDocxButtonProps {
   missao: MissaoGle;
}

/**
 * Nome do arquivo a partir da descrição (a OS), que é como a apuração é
 * reconhecida no papel.
 *
 * `descricao` é texto livre: `/` e `\` quebrariam o caminho no download, e
 * `:` inviabiliza o arquivo no Windows. O `id` entra como sufixo porque não
 * há unicidade de descrição — duas apurações podem descrever a mesma OS, e
 * sem ele a segunda sobrescreveria a primeira na pasta de downloads.
 */
function nomeDoArquivo(missao: MissaoGle): string {
   const base = missao.descricao
      .replace(/[/\\:*?"<>|]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
   return `${base || "GLE"}_${missao.id}.docx`;
}

/**
 * Emite o documento direto, sem etapa intermediária: tudo o que o modelo
 * pede já está na apuração salva, inclusive a identificação do documento,
 * que vem da descrição (a OS).
 */
export function GerarGleDocxButton({ missao }: GerarGleDocxButtonProps) {
   const { push: pushToast } = useToast();
   const [gerando, setGerando] = useState(false);

   async function gerar() {
      setGerando(true);
      try {
         const blob = await gerarDocumentoGleDocx(missao);
         downloadBlob(blob, nomeDoArquivo(missao));
         pushToast({ type: "success", message: "Documento GLE gerado." });
      } catch (error) {
         console.error("Erro ao emitir documento GLE:", error);
         pushToast({
            type: "error",
            message: "Não foi possível gerar o documento GLE. Tente novamente.",
         });
      } finally {
         setGerando(false);
      }
   }

   return (
      // Sem `aria-label`: ele substituiria o nome acessível pelo texto que o
      // usuário de comando de voz não vê, e "clicar Documento" deixaria de
      // funcionar (WCAG 2.5.3). O `span` já nomeia o botão, inclusive no
      // mobile, porque `sr-only` mantém o texto na árvore de acessibilidade.
      <Button
         color="light"
         size="sm"
         onClick={gerar}
         disabled={gerando}
         aria-busy={gerando}
      >
         {gerando ? (
            <Spinner size="sm" color="primary" className="sm:mr-2" />
         ) : (
            <HiDocumentDownload className="size-4 sm:mr-2" />
         )}
         <span className="sr-only sm:not-sr-only">
            {gerando ? "Gerando..." : "Documento"}
         </span>
      </Button>
   );
}
