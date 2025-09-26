import request from "../Api";
import { UserPublic } from "./users";

const indispRoute = "indisp/";

export interface CrewIndisp {
   trig: string,
   id: number,
   func: { func: string, oper: string, proj: string }
}

export interface IndispType {
   id?: number,
   user_id: number,
   date_start: string,
   date_end: string,
   mtv: string,
   obs: string | null,
   created_by?: number,
   created_at?: string,
   user_created?: UserPublic
}

export interface CrewIndispList {
   trip: CrewIndisp,
   indisps: IndispType[]
}

export async function getCrewIndisps(func: string, uae: string) {
   return await request("GET", indispRoute, null, { funcao: func, uae: uae });
}

export async function addIndisp(indisp: IndispType) {
   return await request("POST", indispRoute, indisp);
}

export async function updateIndisp(indisp: IndispType) {
   return await request("PUT", indispRoute + indisp.id, indisp);
}

export async function deleteIndisp(indispId: number) {
   return await request("DELETE", indispRoute + indispId);
}
