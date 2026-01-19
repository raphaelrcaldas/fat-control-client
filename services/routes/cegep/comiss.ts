import request from "../../Api";
import { cegepRoute } from ".";
import { Missao } from "./missoes";
import { UserPublic } from "../users";

const comissRoute = cegepRoute + "comiss/";

export interface Comiss {
   id?: number | null;
   user_id: number;
   user?: UserPublic;
   status: string;
   dep: boolean;

   data_ab: string;
   qtd_aj_ab: number;
   valor_aj_ab: number;

   data_fc: string;
   qtd_aj_fc: number;
   valor_aj_fc: number;

   dias_cumprir: number | null;

   doc_prop: string;
   doc_aut: string;
   doc_enc: string | null;
}

// Lista de comissionamentos (sem missões)
export interface ComissList extends Comiss {
   dias_comp: number;
   diarias_comp: number;
   vals_comp: number;
   modulo: boolean;
   completude: number;
   missoes_count: number;
}

// Detalhe de comissionamento (com missões)
export interface ComissWithMiss extends Comiss {
   missoes: Missao[];
   dias_comp: number;
   diarias_comp: number;
   vals_comp: number;
   modulo: boolean;
   completude: number;
}

export interface ComissFilters {
   status?: string;
   search?: string;
}

export async function getCmtos(
   filters?: ComissFilters,
   signal?: AbortSignal
): Promise<ComissList[]> {
   return (
      await request(
         "GET",
         comissRoute,
         null,
         {
            status: filters?.status ?? "aberto",
            search: filters?.search ?? "",
         },
         signal
      )
   ).json();
}

export async function getCmtoById(
   comissId: number,
   signal?: AbortSignal
): Promise<ComissWithMiss> {
   return (
      await request("GET", `${comissRoute}${comissId}`, null, null, signal)
   ).json();
}

export async function createCmto(comiss: Comiss) {
   return await request("POST", comissRoute, comiss);
}

export async function updateCmto(comiss: Comiss) {
   return await request("PUT", `${comissRoute}${comiss.id}`, comiss);
}

export async function deleteCmto(comissId: number) {
   return await request("DELETE", `${comissRoute}${comissId}`);
}
