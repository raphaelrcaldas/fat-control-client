import type { IdiomStatus } from "../types";

export function getDiffDays(dateStr: string): number {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const date = new Date(dateStr + "T00:00:00");
   return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function getIdiomStatus(
   dateStr: string | null | undefined
): IdiomStatus {
   if (!dateStr) return "empty";
   const diff = getDiffDays(dateStr);
   if (diff < 0) return "danger";
   if (diff <= 60) return "warn";
   return "ok";
}

export function getDaysLabel(dateStr: string | null | undefined): string {
   if (!dateStr) return "";
   const diff = getDiffDays(dateStr);
   if (diff < 0) return `Vencida há ${Math.abs(diff)}d`;
   if (diff <= 60) return `Vence em ${diff}d`;
   return "Regular";
}

export function formatDate(dateStr: string | null | undefined): string {
   if (!dateStr) return "—";
   const [year, month, day] = dateStr.split("-");
   return `${day}/${month}/${year}`;
}

export interface StatusColors {
   text: string;
   badgeBg: string;
   badgeBorder: string;
   dot: string;
}

export function getStatusColors(status: IdiomStatus): StatusColors {
   switch (status) {
      case "danger":
         return {
            text: "#A32D2D",
            badgeBg: "#FCEBEB",
            badgeBorder: "#F09595",
            dot: "#E24B4A",
         };
      case "warn":
         return {
            text: "#854F0B",
            badgeBg: "#FAEEDA",
            badgeBorder: "#EF9F27",
            dot: "#BA7517",
         };
      case "ok":
         return {
            text: "#3B6D11",
            badgeBg: "#EAF3DE",
            badgeBorder: "#97C459",
            dot: "#639922",
         };
      default:
         return {
            text: "#6b7280",
            badgeBg: "#f3f4f6",
            badgeBorder: "#d1d5db",
            dot: "#9ca3af",
         };
   }
}
