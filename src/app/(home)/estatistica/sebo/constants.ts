import type { InfoColumn, InfoColumnConfig } from "./types";

/** Configuração data-driven das colunas de cartões (cabeçalho, tooltip, visibilidade). */
export const INFO_COLUMNS_CONFIG: InfoColumnConfig[] = [
   { key: "cemal", label: "CEMAL", tooltipLabel: "CEMAL" },
   { key: "tovn", label: "TOVN", tooltipLabel: "TOVN" },
   { key: "imae", label: "IMAE", tooltipLabel: "IMAE" },
   { key: "crm", label: "CRM", tooltipLabel: "CRM" },
   { key: "val_pass", label: "PASS", tooltipLabel: "Passaporte" },
   { key: "val_visa", label: "VISA", tooltipLabel: "VISA" },
   { key: "cvi", label: "CVI", tooltipLabel: "CVI", pilotOnly: true },
   { key: "ptai", label: "PTAI", tooltipLabel: "PTAI", pilotOnly: true },
];

export const defaultInfoCols: Record<InfoColumn, boolean> = {
   cemal: true,
   tovn: true,
   imae: true,
   crm: true,
   val_pass: false,
   val_visa: false,
   cvi: false,
   ptai: false,
};

/** Funções de tripulante disponíveis no seletor. */
export const FUNC_OPTIONS: { value: string; label: string }[] = [
   { value: "pil", label: "Piloto" },
   { value: "mc", label: "Mecânico" },
   { value: "lm", label: "LoadMaster" },
   { value: "tf", label: "Comissário" },
   { value: "os", label: "Obs SAR" },
   { value: "oe", label: "OE" },
];

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from(
   { length: currentYear - 2020 + 1 },
   (_, i) => currentYear - i
);
