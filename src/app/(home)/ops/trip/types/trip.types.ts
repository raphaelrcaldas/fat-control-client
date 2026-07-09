import type {
   FuncType,
   OperType,
   ProjType,
   TripFuncFields,
} from "services/routes/funcs";
import type { CrewMember } from "services/routes/trips";

export type Trip = CrewMember;

export type TripFormFields = {
   trig: string;
   active: boolean;
   func: FuncType;
   oper: OperType;
   proj: ProjType;
   data_op: string;
};

export type TripRegisterFormFields = {
   user_id: number;
   active: boolean;
   trig: string;
   func: FuncType;
   oper: OperType;
   proj: ProjType;
   data_op: string;
};

export type { FuncType, OperType, ProjType, TripFuncFields };
