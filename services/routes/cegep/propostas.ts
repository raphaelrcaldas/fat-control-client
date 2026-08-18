import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import type { UserPublic } from "../users";
import { cegepRoute } from ".";

/**
 * Camada de dados das **propostas** de comissionamentos
 * (sandbox: proposta → cenários → linhas).
 *
 * Fala com `/cegep/propostas` (gate RBAC `comiss`, escopo pela org ativa).
 * Os types espelham `api/fcontrol_api/schemas/cegep/propostas.py` — manter os
 * dois consistentes.
 *
 * O backend valida o que a tela também valida: abertura no exercício da
 * proposta, fechamento não antes da abertura, quantidade na lista fechada e
 * militar uma única vez por cenário. Ele é a autoridade; a tela só evita a
 * ida e volta.
 */

/**
 * Ids das cores de cenário. Mora aqui (e não em `cenarioPalette.ts`) para não
 * inverter a dependência service → UI: o service declara o id, a paleta da UI
 * é que referencia este union e mapeia cada id para classes Tailwind literais.
 */
export type CenarioCorId =
   "sky" | "violet" | "emerald" | "rose" | "cyan" | "indigo" | "amber";

export interface PropostaLinha {
   /** Id do backend (futuro); ausente/nulo em linha ainda não persistida. */
   id?: number | null;
   user_id: number;
   /** Denormalizado só para exibição — não viaja no payload de escrita. */
   user?: UserPublic;

   /** Valor-base da abertura, em reais (como `Comiss.valor_aj_ab`). */
   base_ab: number;
   qtd_ab: number;
   /**
    * Exercício em que a abertura pesa. A proposta planeja por ANO — dia e mês
    * não influenciam nenhum cálculo daqui e só seriam ruído para quem preenche;
    * a data cheia é decidida na hora de virar comissionamento de verdade.
    */
   ano_ab: number;

   base_fc: number;
   qtd_fc: number;
   /** Exercício em que o fechamento pesa (>= `ano_ab`). */
   ano_fc: number;
}

export interface PropostaCenario {
   id?: number | null;
   nome: string;
   /** Id da paleta, NUNCA uma classe css. */
   cor: CenarioCorId;
   linhas: PropostaLinha[];
}

export type PropostaStatus = "rascunho";

export interface Proposta {
   id: number;
   nome: string;
   /** Exercício fiscal de referência da proposta. */
   ano_ref: number;
   status: PropostaStatus;
   cenarios: PropostaCenario[];
   /** ISO datetime. */
   updated_at: string;
}

export interface PropostaListItem {
   id: number;
   nome: string;
   ano_ref: number;
   status: PropostaStatus;
   cenarios_count: number;
   updated_at: string;
}

export interface PropostaCreatePayload {
   nome: string;
   ano_ref: number;
}

export interface PropostaUpdatePayload {
   nome: string;
   ano_ref: number;
   cenarios: PropostaCenario[];
}

export interface GetPropostasParams {
   /** Exercício de referência; ausente = todos. */
   ano_ref?: number;
}

const propostasRoute = cegepRoute + "propostas/";

export async function getPropostas(
   params?: GetPropostasParams,
   signal?: AbortSignal
): Promise<PropostaListItem[]> {
   const response = await request(
      "GET",
      propostasRoute,
      null,
      params?.ano_ref ? { ano_ref: params.ano_ref } : null,
      signal
   );
   const json = (await response.json()) as ApiResponse<PropostaListItem[]>;
   return json.data || [];
}

export async function getProposta(
   id: number,
   signal?: AbortSignal
): Promise<Proposta> {
   const response = await request(
      "GET",
      `${propostasRoute}${id}`,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<Proposta>;
   return json.data as Proposta;
}

export async function createProposta(
   payload: PropostaCreatePayload
): Promise<ApiResult<Proposta>> {
   return parseApiResponse<Proposta>(
      await request("POST", propostasRoute, payload)
   );
}

export async function updateProposta(
   id: number,
   payload: PropostaUpdatePayload
): Promise<ApiResult<Proposta>> {
   return parseApiResponse<Proposta>(
      await request("PUT", `${propostasRoute}${id}`, payload)
   );
}

export async function deleteProposta(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${propostasRoute}${id}`)
   );
}
