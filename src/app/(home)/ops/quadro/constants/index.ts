import type { FunctionColors, Aeronave, MissionGroup } from "../types";

export const FUNCTION_COLORS: FunctionColors = {
   mc: {
      bg: "#dc2626",
      border: "#b91c1c",
      text: "#fff",
      label: "Mecânico",
   },
   lm: {
      bg: "#f59e0b",
      border: "#d97706",
      text: "#000",
      label: "Mestre de Cargas",
   },
   os: {
      bg: "#0284c7",
      border: "#0369a1",
      text: "#fff",
      label: "Observador SAR",
   },
   oe: {
      bg: "#14b8a6",
      border: "#0d9488",
      text: "#fff",
      label: "Op. Equipamentos",
   },
   tf: {
      bg: "#059669",
      border: "#047857",
      text: "#fff",
      label: "Comissário",
   },
   pil: {
      bg: "#7c3aed",
      border: "#6d28d9",
      text: "#fff",
      label: "Piloto",
   },
};

export const AERONAVES: Aeronave[] = [
   // { id: 2853, matricula: "2853" },
   { id: 2857, matricula: "2857" },
   { id: 2859, matricula: "2859" },
   { id: 2860, matricula: "2860" },
];

export const MISSION_GROUPS: MissionGroup[] = [
   { id: 1, short: "sobr", long: "sobreaviso" },
   { id: 2, short: "nasc", long: "nacional" },
   { id: 3, short: "local", long: "local" },
   { id: 4, short: "desloc", long: "deslocamento" },
   { id: 5, short: "inter", long: "internacional" },
];
