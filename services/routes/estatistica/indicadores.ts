import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const indicadoresRoute = "estatistica/indicadores/";

/**
 * Bloco de métricas agregadas. Espelha `Metricas` do Pydantic.
 * Unidades: `tvoo` em minutos, `carga`/`peso_lancado` em kg,
 * `comb`/`comb_transf`/`lub` em litros.
 */
export interface Metricas {
   etapas: number;
   tvoo: number;
   pousos: number;
   pax: number;
   carga: number;
   comb: number;
   lub: number;
   pqd: number;
   comb_transf: number;
   heavy_qtd: number;
   cds_qtd: number;
   peso_lancado: number;
}

export interface MesLinha extends Metricas {
   mes: number;
}

export interface RegimeLinha {
   reg: string;
   tvoo: number;
}

export interface TipoMissaoLinha {
   cod: string;
   desc: string;
   tvoo: number;
   etapas: number;
}

export interface AeronaveLinha {
   anv: string;
   projeto: string;
   etapas: number;
   tvoo: number;
   pousos: number;
   carga: number;
   pax: number;
}

export interface PqdTipoLinha {
   tipo: string;
   qtd: number;
}

export interface LancamentoLinha {
   tipo: string;
   qtd: number;
   peso: number;
}

export interface IndicadoresResponse {
   ano_ref: number;
   totais: Metricas;
   mensal: MesLinha[];
   por_regime: RegimeLinha[];
   por_tipo_missao: TipoMissaoLinha[];
   por_aeronave: AeronaveLinha[];
   pqd_por_tipo: PqdTipoLinha[];
   lancamentos: LancamentoLinha[];
}

export interface GetIndicadoresParams {
   ano_ref: number;
   /** Omitido = todos os projetos operados pela org ativa. */
   projeto?: string;
}

export async function getIndicadores(
   params: GetIndicadoresParams,
   signal?: AbortSignal
): Promise<IndicadoresResponse> {
   const response = await request(
      "GET",
      indicadoresRoute,
      null,
      { ano_ref: params.ano_ref, projeto: params.projeto },
      signal
   );

   const json = (await response
      .json()
      .catch(() => null)) as ApiResponse<IndicadoresResponse> | null;

   // Falha de carga tem que virar erro, nunca painel zerado: um ano
   // inteiro de zeros é indistinguível de "a API caiu".
   if (!response.ok || !json?.data) {
      throw new Error(
         json?.message ??
            `Falha ao carregar os indicadores (HTTP ${response.status})`
      );
   }

   return json.data;
}
