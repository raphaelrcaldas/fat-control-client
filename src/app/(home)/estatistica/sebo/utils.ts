import clsx from "clsx";
import {
   daysUntil,
   isoDateToString,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import type { SeboStats } from "./types";

const DATE_BADGE_BASE =
   "inline-block cursor-help rounded px-2 py-1 font-mono text-xs font-semibold text-white";

/** Classe do badge de validade de cartão conforme a proximidade do vencimento. */
export function getDateBadgeClasses(iso: string | null): string {
   if (!iso) return clsx(DATE_BADGE_BASE, "bg-slate-400");
   const diff = daysUntil(iso);
   if (diff <= 0) return clsx(DATE_BADGE_BASE, "bg-red-500");
   if (diff <= 30) return clsx(DATE_BADGE_BASE, "bg-yellow-400 text-slate-800");
   return clsx(DATE_BADGE_BASE, "bg-green-500");
}

/** Tooltip textual do badge de validade. */
export function getDateTooltip(iso: string | null, label: string): string {
   if (!iso) return `${label} não informado`;
   const diff = daysUntil(iso);
   const formatted = isoDateToString(iso);
   if (diff <= 0)
      return `${label} vencido há ${Math.abs(diff)} dias (${formatted})`;
   return `${label} vence em ${diff} dias (${formatted})`;
}

const DSV_BADGE_BASE =
   "inline-block min-w-[40px] rounded px-2 py-1 text-center text-xs font-semibold text-white";

/** Classe do badge de DSV (dias sem voar). */
export function getDsvBadgeClasses(value: number | null): string {
   if (value === null) return clsx(DSV_BADGE_BASE, "bg-slate-400");
   if (value > 45) return clsx(DSV_BADGE_BASE, "bg-red-500");
   if (value > 30) return clsx(DSV_BADGE_BASE, "bg-yellow-400 text-slate-800");
   return clsx(DSV_BADGE_BASE, "bg-green-500");
}

/** Tooltip do DSV: data do último voo. */
export function getDsvTooltip(dataUltVoo: string | null): string {
   if (!dataUltVoo) return "Sem dados de voo";
   return isoDateToString(dataUltVoo);
}

/** Classe do badge de operacionalidade (IN/OP/AL/BA). */
export function getOperBadgeClasses(oper: string): string {
   const base = "inline-block rounded px-3 py-1 text-xs font-bold";
   switch (oper.toLowerCase()) {
      case "al":
         return clsx(base, "bg-green-100 text-green-700");
      case "op":
         return clsx(base, "bg-yellow-100 text-yellow-700");
      case "in":
         return clsx(base, "bg-red-100 text-red-700");
      case "ba":
         return clsx(base, "bg-orange-100 text-orange-700");
      default:
         return clsx(base, "bg-slate-100 text-slate-700");
   }
}

/** Estatísticas (mín/média/máx/total) das horas de voo. Função pura, testável. */
export function computeSeboStats(data: number[]): SeboStats | null {
   if (!data || data.length === 0) return null;
   const soma = data.reduce((acc, curr) => acc + curr, 0);
   const avg = soma / data.length;
   return {
      total: minutesToTime(soma),
      media: minutesToTime(Math.round(avg)),
      mediaRaw: avg,
      max: minutesToTime(Math.max(...data)),
      min: minutesToTime(Math.min(...data)),
      count: data.length,
   };
}

/** HTML do tooltip customizado do gráfico (API do ApexCharts exige string). */
export function renderSeboTooltip(
   trip: SeboTripItem | undefined,
   fallbackCategory: string,
   hours: string
): string {
   const titulo = trip?.trig.toUpperCase() || fallbackCategory;
   const nome = trip?.nome_guerra
      ? `<div style="color:#64748b;font-size:12px;">${trip.nome_guerra.toUpperCase()}</div>`
      : "";
   const oper = trip?.oper
      ? `<div style="margin-top:4px;"><span style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:500;">${trip.oper.toUpperCase()}</span></div>`
      : "";
   return `
      <div style="padding:12px;background:#fff;border-radius:6px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
         <div style="font-weight:bold;color:#0f172a;margin-bottom:4px;">${titulo}</div>
         <div style="color:#dc2626;font-weight:600;font-size:16px;margin-bottom:4px;">${hours}</div>
         ${nome}
         ${oper}
      </div>
   `;
}
