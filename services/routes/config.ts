import { z } from "zod";
import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";

// Configurações da própria organização (org ativa do token — sem sigla na
// URL). Geridas pelo admin do tenant, não pelo admin de sistema.
const configRoute = "config/";

// Cargos institucionais: quem assina os documentos oficiais da org.
// Espelha CargoEnum do backend (fcontrol_api/enums/cargo.py).

export const CARGOS = ["comandante", "chefe-operacoes"] as const;
export type Cargo = (typeof CARGOS)[number];

export const CargoSchema = z.object({
   cargo: z.enum(CARGOS),
   label: z.string(),
   user: z.object({
      id: z.number(),
      nome_completo: z.string().nullable(),
      nome_guerra: z.string(),
      quadro: z.string().nullable(),
      posto: z.object({ mid: z.string() }),
   }),
});

export type CargoTitular = z.infer<typeof CargoSchema>;

/**
 * Monta a linha de assinatura do documento a partir do titular.
 * Ex: "FULANO DA SILVA – Maj QOAV". Posto e nome são derivados do
 * usuário na hora da geração — promoção e troca de titular se propagam sozinhas.
 *
 * Devolve `null` quando o titular não tem nome completo cadastrado. O backend
 * exige o nome completo ao definir o cargo, mas o cadastro pode ser esvaziado
 * depois — sem nome não há assinatura, e assinar com o nome de guerra sairia
 * um documento defeituoso em silêncio.
 */
export function linhaAssinatura(titular: CargoTitular): string | null {
   const { user } = titular;
   if (!user.nome_completo) return null;
   const posto = [user.posto.mid, user.quadro].filter(Boolean).join(" ");
   return `${user.nome_completo.toUpperCase()} – ${posto}`;
}

export async function getCargos(): Promise<CargoTitular[]> {
   const response = await request("GET", `${configRoute}cargos`);
   const json = (await response.json()) as ApiResponse<CargoTitular[]>;

   if (!response.ok) {
      throw new Error(
         json.message || `Failed to fetch cargos: ${response.statusText}`
      );
   }

   return z.array(CargoSchema).parse(json.data);
}

export async function setCargo(
   cargo: Cargo,
   userId: number
): Promise<ApiResult<CargoTitular>> {
   return parseApiResponse<CargoTitular>(
      await request("PUT", `${configRoute}cargos/${cargo}`, {
         user_id: userId,
      })
   );
}

export async function deleteCargo(cargo: Cargo): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${configRoute}cargos/${cargo}`)
   );
}
