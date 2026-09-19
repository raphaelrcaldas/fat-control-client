import request from "../../Api";
import type { ApiResponse } from "@/types/api";
import { cegepRoute } from ".";

const pesquisaRoute = cegepRoute + "gle/pesquisa";

/** Uma etapa que tocou localidade especial — a evidência da passagem. */
export interface EtapaContato {
   etapa_id: number;
   data: string;
   origem: string;
   destino: string;
   anv: string;
   /** ICAO(s) desta etapa que são localidade especial. */
   icaos_loc_esp: string[];
}

export interface LocalidadeTocada {
   loc_esp_id: number;
   cidade: string;
   uf: string;
   grupo: number;
   icaos: string[];
}

export interface MissaoComLocEsp {
   missao_id: number;
   titulo: string | null;
   primeira_data: string;
   ultima_data: string;
   total_etapas: number;
   localidades: LocalidadeTocada[];
   etapas: EtapaContato[];
}

export interface PesquisaLocEsp {
   total_missoes: number;
   missoes: MissaoComLocEsp[];
}

export interface PesquisaLocEspParams {
   data_ini?: string;
   data_fim?: string;
   grupo?: number;
   loc_esp_id?: number;
}

export async function pesquisarMissoes(
   params?: PesquisaLocEspParams,
   signal?: AbortSignal
): Promise<PesquisaLocEsp> {
   const query: Record<string, string | number> = {};
   if (params?.data_ini) query.data_ini = params.data_ini;
   if (params?.data_fim) query.data_fim = params.data_fim;
   if (params?.grupo !== undefined) query.grupo = params.grupo;
   if (params?.loc_esp_id !== undefined) query.loc_esp_id = params.loc_esp_id;

   const response = await request(
      "GET",
      pesquisaRoute,
      null,
      Object.keys(query).length > 0 ? query : null,
      signal
   );
   const json = (await response.json()) as ApiResponse<PesquisaLocEsp>;
   return json.data ?? { total_missoes: 0, missoes: [] };
}
