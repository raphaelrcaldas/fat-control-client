"use client";

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

import { formatNaiveDate } from "utils/dateHandler";
import {
   formatarValorEmReais,
   valorEmReaisPorExtenso,
} from "utils/valorPorExtenso";
import type { TrechoCalculado } from "services/routes/cegep/gleCalculo";
import type { MissaoGle } from "services/routes/cegep/gleMissoes";

const MESES = [
   "JAN",
   "FEV",
   "MAR",
   "ABR",
   "MAI",
   "JUN",
   "JUL",
   "AGO",
   "SET",
   "OUT",
   "NOV",
   "DEZ",
];

/**
 * Gera o documento de GLE a partir da apuração que o backend recalculou.
 *
 * `descricao` alimenta os dois marcadores de identificação do documento: a
 * missão de GLE não guarda número de OM (decisão registrada em
 * `docs/dominio/gle.md`), e é a OS que identifica a apuração na prática.
 */
export async function gerarDocumentoGleDocx(missao: MissaoGle): Promise<Blob> {
   try {
      const response = await fetch("/templates/gle.docx");
      if (!response.ok) {
         throw new Error("Erro ao carregar template gle.docx");
      }

      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
         paragraphLoop: true,
         linebreaks: true,
      });

      doc.render(montarCamposGle(missao));

      const buffer = doc.getZip().generate({
         type: "arraybuffer",
         mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      return new Blob([buffer], {
         type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
   } catch (error) {
      // `cause` preserva o erro original: o docxtemplater descreve bem um
      // marcador corrompido, e essa mensagem some se for descartada aqui.
      // Quem loga é o chamador, uma vez só.
      throw new Error("Falha ao gerar o documento DOCX de GLE.", {
         cause: error,
      });
   }
}

function formatarFraseTrecho(trecho: TrechoCalculado): string {
   const percentual = trecho.grupo === 1 ? "20%" : "10%";
   return `${percentual} de ${formatarPeriodo(
      trecho.chegada,
      trecho.afastamento
   )}`;
}

/**
 * Os seis campos do modelo, separados do I/O para poderem ser testados.
 *
 * `frase` e `pnt` mantêm um item por trecho, na mesma ordem: o texto fixo do
 * modelo diz "respectivamente", então as duas listas se correspondem posição
 * a posição. Deduplicar um lado só quebraria esse pareamento.
 */
export function montarCamposGle(missao: MissaoGle): Record<string, string> {
   return {
      frase: enumerar(missao.trechos.map(formatarFraseTrecho)),
      desc: missao.descricao,
      // Com a UF, como no resto do módulo: há cidades homônimas em estados
      // diferentes, e o documento sai da tela para virar papel.
      pnt: missao.trechos.map((t) => `${t.cidade}-${t.uf}`).join(", "),
      missao: missao.descricao,
      porcent: missao.percentual,
      // O template encosta este marcador no percentual. A primeira quebra
      // mantém os militares numa lista, sem alterar o texto fixo do modelo.
      militares: formatarMilitares(missao),
   };
}

/** Vírgula entre os itens e "e" antes do último: "A, B e C", nunca "A e B e C". */
function enumerar(itens: string[]): string {
   if (itens.length <= 1) return itens[0] ?? "";
   return `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

function formatarPeriodo(inicio: string, fim: string): string {
   const dataInicio = partesDaDataNaive(inicio);
   const dataFim = partesDaDataNaive(fim);

   const inicioCompacto = `${dataInicio.dia}${dataInicio.mes}${dataInicio.ano}`;
   const fimCompacto = `${dataFim.dia}${dataFim.mes}${dataFim.ano}`;
   if (inicioCompacto === fimCompacto) return inicioCompacto;

   if (dataInicio.mes === dataFim.mes && dataInicio.ano === dataFim.ano) {
      return `${dataInicio.dia} a ${fimCompacto}`;
   }

   return `${inicioCompacto} a ${fimCompacto}`;
}

function partesDaDataNaive(iso: string) {
   // O helper preserva a data de parede do datetime do backend; `Date` poderia
   // deslocar um trecho perto da meia-noite conforme o fuso do navegador.
   const data = formatNaiveDate(iso);
   const [dia, mesNumero, ano] = data.split("/");
   const mes = MESES[Number(mesNumero) - 1];
   // Lança em vez de devolver vazio: o documento vai para pagamento, e uma
   // data ilegível emitiria "20% de " no meio da frase, sem erro visível. O
   // `catch` de `gerarDocumentoGleDocx` transforma isto no toast de falha.
   if (!dia || !ano || !mes) {
      throw new Error(`Trecho com data inválida: "${iso}".`);
   }
   return { dia, mes, ano };
}

function formatarMilitares(missao: MissaoGle): string {
   if (missao.militares.length === 0) return "";

   return `\n${missao.militares
      .map(
         (militar) =>
            `${militar.p_g.toUpperCase()} ${militar.nome_guerra.toUpperCase()} — ${formatarValorEmReais(militar.valor)} (${valorEmReaisPorExtenso(militar.valor)})`
      )
      .join("\n")}`;
}
