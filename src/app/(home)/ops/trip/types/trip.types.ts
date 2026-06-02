import type {
   FuncType,
   OperType,
   ProjType,
   CreateCrewFunc,
   CrewFunc,
} from "services/routes/funcs";
import type { CrewMember } from "services/routes/trips";

export type Trip = CrewMember;

export type TripFormFields = {
   trig: string;
   active: boolean;
};

export type FuncFormFields = {
   func: FuncType;
   oper: OperType;
   proj: ProjType;
   data_op: string;
};

export type TripRegisterFormFields = {
   user_id: number;
   active: boolean;
   trig: string;
};

export type { FuncType, OperType, ProjType, CreateCrewFunc, CrewFunc };
