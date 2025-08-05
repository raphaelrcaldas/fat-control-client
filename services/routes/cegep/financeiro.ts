import request from "../../Api";
import { Missao, Pernoite } from "./missoes";
import { cegepRoute } from ".";

export interface MissaoCusto extends Missao {
    pernoites: PernoiteCusto[]
    dias: number
    diarias: number
    valor_total: number
    qtd_ac: number
}

interface valsPernoite {
    valor: number
    qtd: number
}

interface PernoiteCusto extends Pernoite {
    subtotal: number
    qtd_ac: number
    vals: valsPernoite[]
    dias: number
}


const financeiroRoute = cegepRoute + "financeiro/pgts";
export async function getPgts(search): Promise<MissaoCusto[]> {
    return (await request("GET", financeiroRoute, null, search)).json();
}

