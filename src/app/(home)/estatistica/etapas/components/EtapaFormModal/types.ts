import type { FuncType } from "@/constants/tripulantes/funcoes";
import type {
   MissaoComEtapas,
   EtapaItem,
} from "services/routes/estatistica/etapas";

export interface FormData {
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

export interface OIItem {
   uid: string;
   esf_aer_id: number | null;
   tipo_missao_id: number | null;
   reg: "d" | "n" | "v";
   tvoo: number;
   tvooDisplay: string;
}

export interface PoolTrip {
   tripId: number;
   trig: string;
   nomeGuerra: string;
   pGraduacao: string;
}

export interface AssignedTrip extends PoolTrip {
   func: FuncType;
   funcBordo: string;
}

export interface EtapaFormModalProps {
   show: boolean;
   onClose: () => void;
   missao: MissaoComEtapas;
   editingEtapa?: EtapaItem | null;
}
