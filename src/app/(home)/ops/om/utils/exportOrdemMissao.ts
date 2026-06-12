"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type {
   OrdemMissaoOut,
   TripulacaoOrdemOut,
   EtapaOut,
   CampoEspecial,
} from "services/routes/om/ordens";
import {
   formatDateFull,
   formatTimeUTC,
   minutesToTime,
   formatDateForDisplay,
} from "utils/dateHandler";

/**
 * Gera um arquivo DOCX de Ordem de Missão a partir dos dados fornecidos
 * @param ordem Dados completos da Ordem de Missão (formato API)
 * @param uae Sigla da unidade aérea ativa (compõe o número da OM)
 * @returns Blob do arquivo DOCX gerado
 */
export async function gerarOrdemMissaoDocx(
   ordem: OrdemMissaoOut,
   uae: string
): Promise<Blob> {
   try {
      // Carregar o template
      const response = await fetch("/templates/om.docx");
      if (!response.ok) {
         throw new Error("Erro ao carregar template om.docx");
      }
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
         paragraphLoop: true,
         linebreaks: true,
      });

      // Preparar dados para preenchimento
      const dados = {
         numero_om: formatNumeroOM(ordem, uae).toUpperCase(),
         data_missao:
            ordem.etapas.length > 0
               ? formatDateFull(ordem.etapas[0].dt_dep)
               : "",
         doc_acionador: ordem.doc_ref || "N/D",
         comandante: formatComandante(ordem.tripulacao),
         esforco_aereo: minutesToTime(ordem.esf_aer),
         aeronave: ordem.matricula_anv,
         grupos: getCrewGroups(ordem.tripulacao),
         etapas: ordem.etapas.map((etapa: EtapaOut) => ({
            data_etapa: formatDateFull(etapa.dt_dep),
            hora_dep: formatTimeUTC(etapa.dt_dep),
            origem: etapa.origem,
            hora_arr: formatTimeUTC(etapa.dt_arr),
            destino: etapa.dest,
            tev: minutesToTime(etapa.tvoo_etp || 0),
            altn: etapa.alternativa || "N/D",
            tevalt: minutesToTime(etapa.tvoo_alt),
            cmb: `${etapa.qtd_comb}T`,
            esf_aer: etapa.esf_aer,
         })),
         ordens_especiais: formatOrdensEspeciais(ordem.campos_especiais),
      };

      // Renderizar o documento com os dados
      doc.render(dados);

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
      console.error("Erro ao gerar Ordem de Missão DOCX:", error);
      throw new Error("Falha ao gerar o documento DOCX da Ordem de Missão");
   }
}

// --- Funções Auxiliares de Formatação ---

/**
 * Formata o número completo da OM (numero/uae/data)
 */
function formatNumeroOM(ordem: OrdemMissaoOut, uae: string): string {
   const dataSaida = ordem.data_saida
      ? formatDateForDisplay(ordem.data_saida)
      : "DDMMYY";
   return `${ordem.numero}/${uae}/${dataSaida}`;
}

/**
 * Formata o nome do comandante (primeiro piloto da lista)
 */
function formatComandante(tripulacao: TripulacaoOrdemOut[]): string {
   if (!tripulacao || tripulacao.length === 0) return "N/D";
   const piloto = tripulacao.find((t) => t.funcao === "pil");
   if (!piloto || !piloto.tripulante) return "N/D";
   return `${piloto.p_g} ${piloto.tripulante.user?.nome_guerra || ""}`.toUpperCase();
}

function getCrewGroups(tripulacao: TripulacaoOrdemOut[]) {
   if (!tripulacao || tripulacao.length === 0) return "Nenhum tripulante";

   const funcaoLabels: Record<string, string> = {
      pil: "Pilotos",
      mc: "Mecânicos",
      lm: "Loadmaster",
      oe: "OE-3",
      os: "Observador Sar",
      tf: "Comissários",
   };

   const ordemFuncoes = ["pil", "mc", "lm", "tf", "oe", "os"];
   const grupos: { grupo: string; crew_member: string }[] = [];

   // Agrupar tripulantes por função
   const agrupados: Record<string, TripulacaoOrdemOut[]> = {};
   tripulacao.forEach((trip) => {
      if (!agrupados[trip.funcao]) {
         agrupados[trip.funcao] = [];
      }
      agrupados[trip.funcao].push(trip);
   });

   // Formatar cada grupo
   ordemFuncoes.forEach((funcao) => {
      if (agrupados[funcao] && agrupados[funcao].length > 0) {
         const label = funcaoLabels[funcao] || funcao;

         const gg_crew = agrupados[funcao]
            .filter((trip) => trip.tripulante)
            .map((trip) => {
               const nomeCompleto =
                  trip.tripulante!.user?.nome_completo ||
                  trip.tripulante!.user?.nome_guerra ||
                  "";
               const identificacao = trip.tripulante!.user?.id_fab || "N/A";
               return `${trip.p_g} ${nomeCompleto} - ${identificacao}`.toUpperCase();
            });

         grupos.push({
            grupo: label,
            crew_member: gg_crew.join("\n"),
         });
      }
   });

   return grupos;
}

/**
 * Formata os campos especiais como lista numerada
 */
function formatOrdensEspeciais(campos: CampoEspecial[]): string {
   if (!campos || campos.length === 0) {
      return "Nenhuma ordem especial";
   }

   return campos
      .map((campo, index) => {
         const numero = index + 1;
         const prefixo = campo.label ? `${campo.label}: ` : "";
         return `${numero} – ${prefixo}${campo.valor};`;
      })
      .join("\n");
}
