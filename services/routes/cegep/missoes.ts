import request from "../../Api";

import { cegepRoute } from ".";
import { UserPublic } from "../users";
import { Cidade } from "../cities";
import { Etiqueta } from "../cegep/etiquetas";
const missoesRoute = cegepRoute + "missoes/";

export interface UserMission {
   id?: number;
   frag_id?: number;
   sit: string;
   p_g: string;
   user_id: number;
   user: UserPublic;
}

export interface Pernoite {
   id?: number;
   frag_id?: number;
   data_ini: string;
   data_fim: string;
   acrec_desloc: boolean;
   meia_diaria: boolean;
   obs: string;
   cidade_id: number;
   cidade?: Cidade;
   custo?: {
      subtotal: number;
      ac_desloc: number;
      vals: { valor: number; qtd: number }[];
      dias: number;
   };
}

export interface Missao {
   id?: number;
   tipo_doc: string;
   n_doc: number;
   desc: string;
   afast: string;
   regres: string;
   indenizavel: boolean;
   acrec_desloc: boolean;
   obs: string;
   tipo: string;
   pernoites?: Pernoite[];
   users?: UserMission[];
   dias?: number;
   diarias?: number;
   valor_total?: number;
   qtd_ac?: number;
   etiquetas?: Etiqueta[];
}

export async function getFragMissoes(
   reqs?: Record<string, any>
): Promise<Missao[]> {
   // Remove chaves com valores undefined ou string vazia
   const params = reqs
      ? Object.fromEntries(
           Object.entries(reqs).filter(([, v]) => v !== undefined && v !== "")
        )
      : undefined;

   const response = await request("GET", missoesRoute, null, params);
   return (await response.json()) as Missao[];
}

export async function createUpdateFragMis(missao: Missao) {
   return await request("POST", missoesRoute, missao);
}

export async function deleteFragMis(fragId: number) {
   return await request("DELETE", missoesRoute + fragId);
}
