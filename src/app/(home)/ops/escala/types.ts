import type { EscalaSort, EscalaTripEntry } from "services/routes/ops/escala";

export type { EscalaSort };

export interface EscalaFiltersState {
   date_start: string;
   date_end: string;
   tipo_quad_id: number | null;
   funcs: string[];
   sort: EscalaSort;
}

export interface BlockReason {
   kind: "cemal" | "indisp";
   label: string;
   detail?: string;
}

export interface TripStatus {
   trip: EscalaTripEntry;
   isDesadaptado: boolean;
   dsvDias: number | null;
   cemalValid: boolean;
   isAvailable: boolean;
   reasons: BlockReason[];
}

export interface SectionBucket {
   func: string;
   total: number;
   disponiveis: TripStatus[];
   indisponiveis: TripStatus[];
}
