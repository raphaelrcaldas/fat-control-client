import type { FuncType } from "@/constants/tripulantes/funcoes";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";

export interface EtapaFormData {
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   anv: string;
   pousos: number;
   tow: number | null;
   pax: number | null;
   carga: number | null;
   comb: number | null;
   lub: number | null;
   nivel: string;
   sagem: boolean;
   parte1: boolean;
   obs: string;
}

export interface DraftOIItem {
   uid: string;
   esf_aer_id: number | null;
   tipo_missao_id: number | null;
   reg: "d" | "n" | "v";
   tvoo: number;
   tvooDisplay: string;
}

export type PqdTipo = "VTC" | "LV" | "PREC" | "LIVRE";
export type HeavyCdsTipo = "heavy" | "cds";

export interface DraftPqd {
   uid: string;
   tipo: PqdTipo;
   qtd: number | null;
}

export interface DraftRevo {
   uid: string;
   combTransf: number | null;
}

export interface DraftHeavyCds {
   uid: string;
   tipo: HeavyCdsTipo;
   peso: number | null;
   dist: number | null;
   radial: number | null;
}

export type EspecificoKind = "pqd" | "revo" | "heavyCds";

export interface DraftPoolTrip {
   tripId: number;
   trig: string;
   nomeGuerra: string;
   pGraduacao: string;
   lastFunc?: FuncType;
   lastFuncBordo?: string;
   ant?: number;
   ult_promo?: string | null;
   ant_rel?: number | null;
}

export interface DraftAssignedTrip extends DraftPoolTrip {
   func: FuncType;
   funcBordo: string;
}

export type DraftStatus = "rascunho" | "editando" | "ok" | "verificar";

export interface DraftEtapa {
   localId: string;
   serverId: number | null;
   status: DraftStatus;
   form: EtapaFormData;
   oiItems: DraftOIItem[];
   assignedTrips: DraftAssignedTrip[];
   pqd: DraftPqd[];
   revo: DraftRevo[];
   heavyCds: DraftHeavyCds[];
   dirty: boolean;
}

export interface MissaoDraft {
   serverId: number | null;
   titulo: string | null;
   obs: string | null;
   is_simulador: boolean;
   etapas: DraftEtapa[];
   selectedLocalId: string | null;
   initialEtapaServerIds: number[];
   initialSnapshot: string | null;
}

export type MissaoDraftFieldKey = "titulo" | "obs" | "is_simulador";
export type MissaoDraftFieldValue = string | boolean | null;

export type Action =
   | {
        type: "LOAD_FROM_SERVER";
        payload: {
           missao: MissaoComEtapasDetail;
           selectEtapaServerId?: number;
        };
     }
   | {
        type: "RESET_DRAFT";
        payload: { kind: "new" } | { kind: "edit"; initial: MissaoDraft };
     }
   | {
        type: "SET_MISSAO_FIELD";
        payload: {
           field: MissaoDraftFieldKey;
           value: MissaoDraftFieldValue;
        };
     }
   | {
        type: "ADD_ETAPA";
        payload?: { template?: Partial<EtapaFormData> };
     }
   | { type: "REMOVE_ETAPA"; payload: { localId: string } }
   | { type: "SELECT_ETAPA"; payload: { localId: string } }
   | {
        type: "UPDATE_ETAPA_FORM";
        payload: { localId: string; patch: Partial<EtapaFormData> };
     }
   | { type: "ADD_OI"; payload: { localId: string } }
   | { type: "REMOVE_OI"; payload: { localId: string; uid: string } }
   | {
        type: "UPDATE_OI";
        payload: {
           localId: string;
           uid: string;
           patch: Partial<DraftOIItem>;
        };
     }
   | {
        type: "ADD_TRIP";
        payload: { localId: string; trip: DraftAssignedTrip };
     }
   | {
        type: "REMOVE_TRIP";
        payload: { localId: string; tripId: number };
     }
   | {
        type: "UPDATE_FUNC_BORDO";
        payload: { localId: string; tripId: number; funcBordo: string };
     }
   | {
        type: "MOVE_TRIP_TO_FUNC";
        payload: { localId: string; tripId: number; func: FuncType };
     }
   | {
        type: "SET_ETAPA_TRIPS";
        payload: { localId: string; trips: DraftAssignedTrip[] };
     }
   | {
        type: "SET_ETAPA_OIS";
        payload: { localId: string; ois: DraftOIItem[] };
     }
   | {
        type: "ADD_ESPECIFICO";
        payload: { localId: string; kind: EspecificoKind };
     }
   | {
        type: "REMOVE_ESPECIFICO";
        payload: { localId: string; kind: EspecificoKind; uid: string };
     }
   | {
        type: "UPDATE_PQD";
        payload: { localId: string; uid: string; patch: Partial<DraftPqd> };
     }
   | {
        type: "UPDATE_REVO";
        payload: { localId: string; uid: string; patch: Partial<DraftRevo> };
     }
   | {
        type: "UPDATE_HEAVY_CDS";
        payload: {
           localId: string;
           uid: string;
           patch: Partial<DraftHeavyCds>;
        };
     }
   | {
        type: "MARK_ETAPA_PERSISTED";
        payload: { localId: string; serverId: number };
     }
   | { type: "MARK_MISSAO_PERSISTED"; payload: { serverId: number } }
   | { type: "RECOMPUTE_SNAPSHOT" }
   | { type: "REVERT_DRAFT" };
