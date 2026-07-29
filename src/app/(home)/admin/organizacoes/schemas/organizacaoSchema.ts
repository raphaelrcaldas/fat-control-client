import { z } from "zod";
import type { Organizacao } from "services/routes/organizacoes";

/**
 * Espelha `OrganizacaoBase` (`api/fcontrol_api/schemas/organizacao.py`) —
 * manter os limites em sincronia com o Pydantic.
 *
 * `sigla` é a PK e viaja em lugares que não toleram espaço/acento/maiúscula:
 * URL da API (`/organizacoes/{sigla}`), cookie de tema/marca e nome do arquivo
 * de brasão (`public/brasoes/<sigla>.jpg`, ver `lib/orgBrasao.ts`). Por isso é
 * normalizada e restrita aqui — o backend aceita string livre.
 */
export const organizacaoFormSchema = z.object({
   sigla: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Sigla é obrigatória")
      .max(20, "Sigla deve ter no máximo 20 caracteres")
      .regex(
         /^[a-z0-9_-]+$/,
         "Use apenas letras, números, hífen ou underscore — sem espaços ou acentos"
      ),
   sigla_2: z
      .string()
      .trim()
      .max(20, "Sigla 2 deve ter no máximo 20 caracteres"),
   sigla_3: z
      .string()
      .trim()
      .max(20, "Sigla 3 deve ter no máximo 20 caracteres"),
   nome: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(150, "Nome deve ter no máximo 150 caracteres"),
   alias: z
      .string()
      .trim()
      .max(100, "Codinome deve ter no máximo 100 caracteres"),
});

export type OrganizacaoFormData = z.infer<typeof organizacaoFormSchema>;

/** Valores iniciais do formulário (vazios na criação). */
export function makeDefaultOrganizacaoValues(
   org?: Organizacao | null
): OrganizacaoFormData {
   return {
      sigla: org?.sigla ?? "",
      sigla_2: org?.sigla_2 ?? "",
      sigla_3: org?.sigla_3 ?? "",
      nome: org?.nome ?? "",
      alias: org?.alias ?? "",
   };
}

/** Campo opcional em branco viaja como `null`, nunca como string vazia. */
export function toOrganizacaoPayload(data: OrganizacaoFormData) {
   return {
      sigla: data.sigla,
      nome: data.nome,
      sigla_2: data.sigla_2 || null,
      sigla_3: data.sigla_3 || null,
      alias: data.alias || null,
   };
}
