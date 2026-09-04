import { formatSaram } from "@/constants/formats/saram";
import { isoDateToString } from "@/../utils/dateHandler";
import type { ExportColumn } from "./exportTypes";

/**
 * Minimo que uma linha precisa expor para gerar as colunas de identidade.
 *
 * As telas guardam o militar de tres jeitos diferentes — solto (`UserPublic`
 * em /users), aninhado (`.user` nos tripulantes) ou achatado numa projecao
 * propria (passaportes, CRM, cartoes) — e por isso o acesso entra por
 * funcao, nao por heranca de tipo. Tudo alem das tres colunas fixas e
 * opcional: projecao que nao carrega o campo simplesmente omite a coluna.
 */
export interface MilitarLike {
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   quadro?: string | null;
   esp?: string | null;
   saram?: string | null;
   id_fab?: string | null;
   unidade?: string | null;
   telefone?: string | null;
   nasc?: string | null;
   ult_promo?: string | null;
   ant_rel?: number | null;
   active?: boolean;
}

export type MilitarColumnKey =
   | "p_g"
   | "nome_guerra"
   | "nome_completo"
   | "quadro"
   | "esp"
   | "saram"
   | "id_fab"
   | "unidade"
   | "telefone"
   | "nasc"
   | "ult_promo";

/**
 * Colunas de identidade militar. As tres primeiras sao `required` — saem em
 * toda planilha do sistema, por decisao de padronizacao.
 *
 * `uppercase` em tudo que e identidade (posto, nomes, quadro, especialidade,
 * unidade): o dado no banco nao e confiavelmente maiusculo, e a convencao do
 * projeto manda exibir assim.
 */
export function militarColumns<T>(
   get: (row: T) => MilitarLike,
   options?: { omit?: MilitarColumnKey[] }
): ExportColumn<T>[] {
   const omit = new Set(options?.omit ?? []);

   const all: ExportColumn<T>[] = [
      {
         key: "p_g",
         label: "P/G",
         required: true,
         uppercase: true,
         width: 12,
         // Sigla crua do banco (MJ), nao a abreviatura de tratamento (MAJ).
         get: (row) => get(row).p_g,
      },
      {
         key: "nome_guerra",
         label: "Nome de Guerra",
         required: true,
         uppercase: true,
         get: (row) => get(row).nome_guerra,
      },
      {
         key: "nome_completo",
         label: "Nome Completo",
         required: true,
         uppercase: true,
         get: (row) => get(row).nome_completo,
      },
      {
         key: "quadro",
         label: "Quadro",
         uppercase: true,
         width: 12,
         get: (row) => get(row).quadro,
      },
      {
         key: "esp",
         label: "Especialidade",
         uppercase: true,
         width: 14,
         get: (row) => get(row).esp,
      },
      {
         key: "saram",
         label: "SARAM",
         align: "center",
         width: 12,
         get: (row) => {
            const saram = get(row).saram;
            return saram ? formatSaram(saram) : null;
         },
      },
      {
         key: "id_fab",
         label: "ID FAB",
         align: "center",
         width: 12,
         get: (row) => get(row).id_fab,
      },
      {
         key: "unidade",
         label: "Unidade",
         uppercase: true,
         align: "center",
         width: 12,
         get: (row) => get(row).unidade,
      },
      {
         key: "telefone",
         label: "Telefone",
         align: "center",
         sensitive: true,
         width: 16,
         get: (row) => get(row).telefone,
      },
      {
         key: "nasc",
         label: "Nascimento",
         align: "center",
         sensitive: true,
         width: 14,
         get: (row) => {
            const nasc = get(row).nasc;
            return nasc ? isoDateToString(nasc) : null;
         },
      },
      {
         key: "ult_promo",
         label: "Última Promoção",
         align: "center",
         width: 16,
         get: (row) => {
            const promo = get(row).ult_promo;
            return promo ? isoDateToString(promo) : null;
         },
      },
   ];

   return all.filter((c) => !omit.has(c.key as MilitarColumnKey));
}
