import request from "../../Api";

import { cegepRoute } from ".";


const financeiroRoute = cegepRoute + "financeiro/pgts";
export async function getPgts(search) {
    return (await request("GET", financeiroRoute, null, search)).json();
}

