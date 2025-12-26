import request from "../../Api";
import { Missao } from "./missoes";
import { cegepRoute } from ".";

const financeiroRoute = cegepRoute + "financeiro/pgts";
export async function getPgts(search): Promise<Missao[]> {
   return (await request("GET", financeiroRoute, null, search)).json();
}
