import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { DuplaPilot } from "../types";

/** Ordena etapas por data + horário de decolagem (ascendente), sem mutar a entrada. */
export function sortEtapas(etapas: EtapaItem[]): EtapaItem[] {
   return etapas
      .slice()
      .sort((a, b) => `${a.data}T${a.dep}`.localeCompare(`${b.data}T${b.dep}`));
}

/** Monta o rótulo "P_G NOME · P_G NOME" dos pilotos da dupla. */
export function formatPilotNames(
   pilots: { p_g: string; nome_guerra: string }[]
): string {
   if (pilots.length === 0) return "Sem pilotos";
   return pilots.map((p) => `${p.p_g} ${p.nome_guerra}`).join(" · ");
}

// Janela de sanidade para o ano de uma etapa: sem ela, uma data digitada
// errada (ex. ano 0006) pode virar a unica candidata quando nao ha maioria
// (tipicamente a 1ª sessao da missao), autoaprovando o erro e, pior, travando
// a correcao depois — ao digitar o ano certo, a validacao passa a acusar ELE
// como fora do padrao, porque o padrao errado virou a referencia.
const ANO_MIN = 2000;
const ANO_MAX = new Date().getFullYear() + 1;

/**
 * Ano de referencia da missao: o mais frequente entre as sessoes. Usa a
 * maioria, e nao a primeira sessao, porque uma data digitada errada (ex. ano
 * 0006) nao pode virar a referencia que valida as demais.
 */
export function anoDominante(etapas: EtapaItem[]): number | null {
   const contagem = new Map<number, number>();
   for (const etapa of etapas) {
      if (!etapa.data) continue;
      const ano = Number(etapa.data.slice(0, 4));
      if (!Number.isInteger(ano) || ano < ANO_MIN || ano > ANO_MAX) continue;
      contagem.set(ano, (contagem.get(ano) ?? 0) + 1);
   }

   let melhor: number | null = null;
   let melhorQtd = 0;
   for (const [ano, qtd] of contagem) {
      // Empate fica com o ano maior: o mais recente e o provavel correto.
      if (
         qtd > melhorQtd ||
         (qtd === melhorQtd && melhor !== null && ano > melhor)
      ) {
         melhor = ano;
         melhorQtd = qtd;
      }
   }
   return melhor;
}

export function collectPilotos(etapas: EtapaItem[]): DuplaPilot[] {
   const pilotos = new Map<number, DuplaPilot>();

   for (const etapa of etapas) {
      for (const trip of etapa.tripulantes) {
         if (!pilotos.has(trip.trip_id)) {
            pilotos.set(trip.trip_id, {
               trip_id: trip.trip_id,
               trig: trip.trig,
               nome_guerra: trip.nome_guerra,
               p_g: trip.p_g,
               func: trip.func,
               func_bordo: trip.func_bordo,
            });
         }
      }
   }

   return Array.from(pilotos.values()).sort(
      (first, second) => first.trip_id - second.trip_id
   );
}
