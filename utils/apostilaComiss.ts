"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { ComissWithMiss } from "services/routes/cegep/comiss";

export async function gerarRelatorioDocx(
   comiss: ComissWithMiss
): Promise<Blob> {
   try {
      // Carregar o template
      const response = await fetch("/templates/apostila.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
         paragraphLoop: true,
         linebreaks: true,
      });

      // Preparar dados do usuário
      const user = comiss.user;
      const nameLabel =
         `${user.p_g} ${user.esp} ${user.nome_completo} (${user.saram})`.toUpperCase();

      // Preparar dados das missões
      const modulos = (comiss.missoes || []).map((mis, index) => {
         const romano = romanize(index + 1);
         const om_os = `${mis.tipo_doc} ${mis.n_doc}`.toUpperCase();
         const tipo =
            mis.tipo == "tal"
               ? "Transporte Aerologístico"
               : `Missão ${mis.tipo.toUpperCase()}`;
         const localidades = mis.pernoites
            .map(
               (pnt) =>
                  `${pnt.cidade.nome}-${
                     pnt.cidade.uf
                  } (${pnt.custo.dias.toFixed(1)})`
            )
            .join(", ");

         const afast = new Date(mis.afast).toLocaleDateString();
         const regres = new Date(mis.regres).toLocaleDateString();

         const d = mis.dias > 1 ? "dias" : "dia";
         return `\t${romano} - ${om_os}, ${tipo}, ${localidades}, de ${afast} a ${regres} (${mis.dias} ${d});`;
      });

      // Preencher o template com os dados
      doc.setData({
         name: nameLabel,
         total_dias: comiss.dias_comp,
         modulos: modulos.join("\n"),
      });

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
      console.error("Erro ao gerar relatório DOCX:", error);
      throw new Error("Falha ao gerar o relatório DOCX");
   }
}

function romanize(num: number) {
   if (isNaN(num)) return NaN;
   var digits = String(+num).split(""),
      key = [
         "",
         "C",
         "CC",
         "CCC",
         "CD",
         "D",
         "DC",
         "DCC",
         "DCCC",
         "CM",
         "",
         "X",
         "XX",
         "XXX",
         "XL",
         "L",
         "LX",
         "LXX",
         "LXXX",
         "XC",
         "",
         "I",
         "II",
         "III",
         "IV",
         "V",
         "VI",
         "VII",
         "VIII",
         "IX",
      ],
      roman = "",
      i = 3;
   while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;

   return Array(+digits.join("") + 1).join("M") + roman;
}
