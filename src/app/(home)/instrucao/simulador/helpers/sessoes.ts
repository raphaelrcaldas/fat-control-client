import type { EtapaItem } from "services/routes/estatistica/etapas";

/** Ordena etapas por data + horário de decolagem (ascendente), sem mutar a entrada. */
export function sortEtapas(etapas: EtapaItem[]): EtapaItem[] {
   return etapas
      .slice()
      .sort((a, b) => `${a.data}T${a.dep}`.localeCompare(`${b.data}T${b.dep}`));
}

/** Monta o rótulo "P_G NOME / P_G NOME" dos pilotos da dupla. */
export function formatPilotNames(
   pilots: { p_g: string; nome_guerra: string }[]
): string {
   if (pilots.length === 0) return "Sem pilotos";
   return pilots.map((p) => `${p.p_g} ${p.nome_guerra}`).join(" / ");
}
