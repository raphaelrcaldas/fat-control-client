import type { OIItem } from "./types";
import { timeToMinutes } from "@/../utils/dateHandler";

/**
 * Calcula tvoo em minutos. arr DEVE ser maior que dep no
 * mesmo dia. arr == 00:00 com dep > 00:00 representa fim do
 * dia (24:00). Retorna 0 se invalido (atravessa o dia).
 */
export function calcTvoo(dep: string, arr: string): number {
   if (!dep || !arr) return 0;
   const [dh, dm] = dep.split(":").map(Number);
   const [ah, am] = arr.split(":").map(Number);
   const depMin = dh * 60 + dm;
   let arrMin = ah * 60 + am;
   if (arrMin === 0 && depMin > 0) arrMin = 1440;
   if (arrMin <= depMin) return 0;
   return arrMin - depMin;
}

export function newOiItem(): OIItem {
   return {
      uid: `oi-${Date.now()}-${Math.random()}`,
      esf_aer_id: null,
      tipo_missao_id: null,
      reg: "d",
      tvoo: 0,
      tvooDisplay: "",
   };
}

export function formatTimeInput(input: string): string {
   const digits = input.replace(/\D/g, "");
   if (digits.length === 0) return "";
   if (digits.length <= 2) return digits;
   return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export function finalizeTimeInput(display: string): {
   tvoo: number;
   tvooDisplay: string;
} {
   const digits = display.replace(/\D/g, "");
   if (digits.length === 0) return { tvoo: 0, tvooDisplay: "00:00" };
   let h: string, m: string;
   if (digits.length <= 2) {
      h = digits.padStart(2, "0");
      m = "00";
   } else {
      h = digits.slice(0, 2).padStart(2, "0");
      m = digits.slice(2).padEnd(2, "0");
   }
   const mins = Math.min(parseInt(m), 59);
   const finalDisplay = `${h}:${mins.toString().padStart(2, "0")}`;
   return { tvoo: timeToMinutes(finalDisplay), tvooDisplay: finalDisplay };
}

export function timeToHHmm(timeStr: string): string {
   if (!timeStr) return "";
   return timeStr.slice(0, 5);
}
