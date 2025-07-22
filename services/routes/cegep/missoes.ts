import request from "../../Api";

import { cegepRoute } from ".";
import { UserPublic } from "../users";
import { Cidade } from "../cities";

const missoesRoute = cegepRoute + "missoes/"

export interface UserMission {
   id?: number,
   frag_id?: number,
   sit: string,
   p_g: string
   user_id: number,
   user: UserPublic,
}

export interface Pernoite {
   id?: number,
   frag_id?: number,
   data_ini: string,
   data_fim: string,
   acrec_desloc: boolean,
   meia_diaria: boolean,
   obs: string,
   cidade_id: number,
   cidade: Cidade
}

export interface Missao {
   id?: number,
   tipo_doc: string,
   n_doc: number,
   desc: string,
   afast: string,
   regres: string,
   indenizavel: boolean,
   obs: string,
   tipo: string,
   pernoites?: Pernoite[],
   users?: UserMission[]
}

export async function getFragMissoes(dataIni, dataFim): Promise<Missao[]> {
   return (await request("GET", missoesRoute + `?ini=${dataIni}&fim=${dataFim}`)).json();
}

export async function createUpdateFragMis(missao: Missao) {
   return await request("POST", missoesRoute, missao);
}

export async function deleteFragMis(fragId: number) {
   return await request("DELETE", missoesRoute + fragId);
}
