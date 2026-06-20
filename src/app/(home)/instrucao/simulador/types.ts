import type { EtapaItem } from "services/routes/estatistica/etapas";

export const MAX_PILOTOS = 2;
export const SIM_ANV = "2850";

export interface DuplaPilot {
   trip_id: number;
   trig: string;
   nome_guerra: string;
   p_g: string;
   func: string;
   func_bordo: string;
}

/** Resultado de busca de tripulante (vindo da API de trips) já normalizado. */
export interface CrewSearchResult {
   id: number;
   trig: string;
   nome_guerra: string;
   p_g: string;
}

export interface Dupla {
   key: string;
   pilots: DuplaPilot[];
   etapas: EtapaItem[];
   missaoId: number;
}

export interface PendingDupla {
   key: string;
   missaoId: number;
   pilots: DuplaPilot[];
}
