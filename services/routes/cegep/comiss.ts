import request from "../../Api";
import { cegepRoute } from ".";
import { Missao } from "./missoes";
import { UserPublic } from "../users";

const comissRoute = cegepRoute + "comiss/"

export interface Comiss {
    id?: number | null
    user_id: number
    user?: UserPublic
    status: string
    dep: boolean

    data_ab: string
    qtd_aj_ab: number
    valor_aj_ab: number

    data_fc: string
    qtd_aj_fc: number
    valor_aj_fc: number

    dias_cumprir: number | null

    doc_prop: string
    doc_aut: string
    doc_enc: string | null
}

export interface ComissWithMiss extends Comiss {
    missoes: Missao[]
    dias_comp: number
    diarias_comp: number
    vals_comp: number
    modulo: boolean
}

export async function getCmtos(): Promise<ComissWithMiss[]> {
    return (await request("GET", comissRoute)).json();
}

export async function createCmto(comiss: Comiss) {
    return (await request("POST", comissRoute, comiss));
}

export async function updateCmto(comiss: Comiss) {
    return (await request("PUT", `${comissRoute}${comiss.id}`, comiss));
}

export async function deleteCmto(comissId: number) {
    return (await request("DELETE", `${comissRoute}${comissId}`));
}
