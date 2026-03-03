import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";

export interface GroupSummary {
   label: string;
   alocado: number;
   voado: number;
   saldo: number;
}

const GROUPS = ["COMPREP", "COMAE", "DCTA"] as const;

export function getGroupSummaries(items: EsfAerResumoItem[]): GroupSummary[] {
   return GROUPS.map((group) => {
      const groupItems = items.filter((item) =>
         item.descricao.startsWith(group)
      );
      return {
         label: group,
         alocado: groupItems.reduce((sum, i) => sum + i.alocado, 0),
         voado: groupItems.reduce((sum, i) => sum + i.voado, 0),
         saldo: groupItems.reduce((sum, i) => sum + i.saldo, 0),
      };
   });
}

/**
 * Formats minutes to "HH:mm", supporting negative values with a "-" prefix.
 */
export function formatMinutes(minutes: number): string {
   if (minutes < 0) {
      const abs = Math.abs(minutes);
      return `-${minutesToTime(abs)}`;
   }
   return minutesToTime(minutes);
}

/**
 * Returns Tailwind classes for the "Esforco Aereo" description cell
 * based on the description text content.
 */
export function getDescricaoStyles(descricao: string): string {
   return clsx("text-left whitespace-nowrap text-gray-900", {
      "text-orange-400": descricao.includes("COMPREP"),
      "text-blue-500": descricao.includes("COMAE"),
      "font-bold": descricao.includes("SESQAE"),
   });
}
