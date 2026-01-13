"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { OrdemMissaoOut } from "services/routes/om/ordens";
import {
   extractTime,
   formatDateFull,
   minutesToTime,
   calcularTempoVooMinutos,
} from "utils/dateHandler";

/**
 * Gera um arquivo DOCX de Pedido de Lanche a partir dos dados fornecidos
 * @param ordem Dados completos da Ordem de Missão (formato API)
 * @returns Blob do arquivo DOCX gerado
 */
export async function gerarPedidoLanche(ordem: OrdemMissaoOut): Promise<Blob> {
   try {
      // Carregar o template
      const response = await fetch("/templates/pedido_lanche.docx");
      if (!response.ok) {
         throw new Error("Erro ao carregar template pedido_lanche.docx");
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
         paragraphLoop: true,
         linebreaks: true,
      });

      // Extrair tripulantes de todas as funções
      const todosTripulantes: string[] = [];
      if (ordem.tripulacao && Array.isArray(ordem.tripulacao)) {
         for (const tripItem of ordem.tripulacao) {
            if (tripItem.tripulante) {
               const nome = tripItem.tripulante.user
                  ? `${tripItem.tripulante.user.p_g} ${tripItem.tripulante.user.nome_guerra}`
                  : tripItem.tripulante.trig || "N/A";
               todosTripulantes.push(nome.toUpperCase());
            }
         }
      }

      // Dividir tripulantes em 3 grupos balanceados
      const dividirEmGrupos = (
         items: string[],
         numGrupos: number
      ): string[][] => {
         const grupos: string[][] = Array.from({ length: numGrupos }, () => []);
         items.forEach((item, index) => {
            grupos[index % numGrupos].push(item);
         });
         return grupos;
      };
      const grupos = dividirEmGrupos(todosTripulantes, 3);

      // Dados da etapa 1
      const etapa1 = ordem.etapas?.[0];
      let destino = "";
      let depZulu = "";
      let depLocal = "";
      let tempoVoo = "";

      if (etapa1) {
         destino = etapa1.dest || "";
         // Hora de decolagem em ZULU
         depZulu = extractTime(etapa1.dt_dep || "");
         // Converter para hora local (UTC-3)
         if (depZulu) {
            const [horas, minutos] = depZulu.split(":").map(Number);
            let horaLocal = horas - 3;
            if (horaLocal < 0) horaLocal += 24;
            depLocal = `${String(horaLocal).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
         }
         // Tempo de voo da etapa 1 (usando tvoo_etp do backend)
         if (etapa1.tvoo_etp && etapa1.tvoo_etp > 0) {
            tempoVoo = minutesToTime(etapa1.tvoo_etp);
         } else if (etapa1.dt_dep && etapa1.dt_arr) {
            tempoVoo = minutesToTime(
               calcularTempoVooMinutos(etapa1.dt_dep, etapa1.dt_arr)
            );
         }
      }

      // Preparar dados para preenchimento
      const dados = {
         anv: ordem.matricula_anv,
         data_saida: formatDateFull(ordem.data_saida),
         numero: ordem.numero,
         qtd_trip: String(todosTripulantes.length),
         dest: destino,
         dep_z: depZulu,
         dep_p: depLocal,
         tev: tempoVoo,
         grupo_1: grupos[0]?.join("\n") || "",
         grupo_2: grupos[1]?.join("\n") || "",
         grupo_3: grupos[2]?.join("\n") || "",
      };

      // Preencher o template com os dados
      doc.setData(dados);

      // Renderizar o documento
      doc.render();

      // Gerar o buffer
      const buffer = doc.getZip().generate({
         type: "arraybuffer",
         mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Criar e retornar o blob
      const blob = new Blob([buffer], {
         type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      return blob;
   } catch (error) {
      console.error("Erro ao gerar Pedido de Lanche DOCX:", error);
      throw new Error("Falha ao gerar o documento Pedido de Lanche");
   }
}
