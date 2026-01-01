import request from "../../Api";
import { Missao } from "./missoes";
import { cegepRoute } from ".";

const financeiroRoute = cegepRoute + "financeiro/pgts";

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   limit: number;
   total_pages: number;
}

export async function getPgts(search): Promise<PaginatedResponse<Missao>> {
   return (await request("GET", financeiroRoute, null, search)).json();
}
