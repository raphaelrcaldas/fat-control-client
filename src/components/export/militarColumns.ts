import { formatSaram } from "@/constants/formats/saram";
import { isoDateToString } from "@/../utils/dateHandler";
import type { ExportColumn } from "./exportTypes";

/**
 * Minimo que uma linha precisa expor para gerar as colunas de identidade.
 *
 * As telas guardam o militar de tres jeitos diferentes — solto (`UserPublic`
 * em /users), aninhado (`.user` nos tripulantes) ou achatado numa projecao
 * propria (passaportes, CRM, cartoes) — e por isso o acesso entra por
 * funcao, nao por heranca de tipo. Tudo alem das colunas fixas e opcional; e
 * projecao que nao carregue um campo fixo tem que passa-lo em `omit`, senao a
 * coluna sai vazia em todas as linhas.
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
   // Só existem depois da hidratação por `POST /users/export` — nenhuma
   // listagem os carrega. Opcionais no tipo justamente por isso.
   cpf?: string | null;
   email_fab?: string | null;
   email_pess?: string | null;
   data_praca?: string | null;
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
   | "ult_promo"
   | "cpf"
   | "email_fab"
   | "email_pess"
   | "data_praca";

/**
 * Colunas que so existem depois da hidratacao por `POST /users/export`.
 *
 * A tela que nao puder hidratar (sem `users.export`) passa estas em `omit`:
 * oferecer coluna que sairia vazia em toda linha e pior do que nao oferecer.
 */
export const MILITAR_HYDRATED_COLUMNS: MilitarColumnKey[] = [
   "telefone",
   "nasc",
   "cpf",
   "email_fab",
   "email_pess",
   "data_praca",
];

/**
 * Colunas de identidade militar. As cinco primeiras sao `required` e saem
 * nesta ordem — P/G, quadro, especialidade, nome de guerra, nome completo —
 * em toda planilha do sistema, por decisao de padronizacao. Projecao que nao
 * carrega quadro/esp (CRM, por exemplo) precisa passar as duas em `omit`.
 *
 * `uppercase` em tudo que e identidade (posto, nomes, quadro, especialidade,
 * unidade): o dado no banco nao e confiavelmente maiusculo, e a convencao do
 * projeto manda exibir assim.
 */
/**
 * Secoes do seletor de colunas, iguais as do formulario de cadastro
 * (`UserForm/FormSections.tsx`) — quem preenche o cadastro reconhece o
 * agrupamento na hora de exportar.
 */
export const GRUPO_MILITAR = "Dados Militares";
export const GRUPO_PESSOAL = "Dados Pessoais";

export function militarColumns<T>(
   get: (row: T) => MilitarLike,
   options?: { omit?: MilitarColumnKey[] }
): ExportColumn<T>[] {
   const omit = new Set(options?.omit ?? []);

   const all: ExportColumn<T>[] = [
      {
         key: "p_g",
         samples: ["TC", "MJ", "1S"],
         group: GRUPO_MILITAR,
         label: "P/G",
         required: true,
         uppercase: true,
         width: 12,
         // Sigla crua do banco (MJ), nao a abreviatura de tratamento (MAJ).
         get: (row) => get(row).p_g,
      },
      {
         key: "quadro",
         samples: ["QOAV", "QOEA", "QSS"],
         group: GRUPO_MILITAR,
         label: "Quadro",
         required: true,
         uppercase: true,
         width: 12,
         get: (row) => get(row).quadro,
      },
      {
         key: "esp",
         samples: ["NTE", "INF", "SAD"],
         group: GRUPO_MILITAR,
         label: "Especialidade",
         required: true,
         uppercase: true,
         width: 14,
         get: (row) => get(row).esp,
      },
      {
         key: "nome_guerra",
         samples: ["FULANO", "BELTRANO", "SICRANA"],
         group: GRUPO_MILITAR,
         label: "Nome de Guerra",
         required: true,
         uppercase: true,
         get: (row) => get(row).nome_guerra,
      },
      {
         key: "nome_completo",
         samples: [
            "FULANO DA SILVA",
            "BELTRANO DE SOUZA",
            "SICRANA PEREIRA LIMA",
         ],
         group: GRUPO_PESSOAL,
         label: "Nome Completo",
         required: true,
         uppercase: true,
         get: (row) => get(row).nome_completo,
      },
      {
         key: "saram",
         samples: ["400000-0", "410000-1", "420000-2"],
         group: GRUPO_MILITAR,
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
         samples: ["500000", "510000", "520000"],
         group: GRUPO_MILITAR,
         label: "ID FAB",
         align: "center",
         width: 12,
         get: (row) => get(row).id_fab,
      },
      {
         key: "unidade",
         samples: ["11GT", "11GT", "11GT"],
         group: GRUPO_MILITAR,
         label: "Unidade",
         uppercase: true,
         align: "center",
         width: 12,
         get: (row) => get(row).unidade,
      },
      {
         key: "telefone",
         samples: ["21900000000", "21911111111", "21922222222"],
         group: GRUPO_PESSOAL,
         label: "Telefone",
         align: "center",
         hydrated: true,
         width: 16,
         get: (row) => get(row).telefone,
      },
      {
         key: "nasc",
         samples: ["01/01/80", "02/02/85", "03/03/90"],
         group: GRUPO_PESSOAL,
         label: "Nascimento",
         align: "center",
         hydrated: true,
         width: 14,
         get: (row) => {
            const nasc = get(row).nasc;
            return nasc ? isoDateToString(nasc) : null;
         },
      },
      {
         key: "ult_promo",
         samples: ["31/12/20", "31/12/22", "31/12/24"],
         group: GRUPO_MILITAR,
         label: "Última Promoção",
         align: "center",
         width: 16,
         get: (row) => {
            const promo = get(row).ult_promo;
            return promo ? isoDateToString(promo) : null;
         },
      },
      {
         key: "data_praca",
         samples: ["01/03/00", "01/03/05", "01/03/10"],
         group: GRUPO_MILITAR,
         label: "Data de Praça",
         align: "center",
         hydrated: true,
         width: 16,
         get: (row) => {
            const praca = get(row).data_praca;
            return praca ? isoDateToString(praca) : null;
         },
      },
      {
         key: "cpf",
         samples: ["00000000000", "11111111111", "22222222222"],
         group: GRUPO_PESSOAL,
         label: "CPF",
         align: "center",
         hydrated: true,
         width: 16,
         get: (row) => get(row).cpf,
      },
      {
         key: "email_fab",
         samples: [
            "fulano@fab.mil.br",
            "beltrano@fab.mil.br",
            "sicrana@fab.mil.br",
         ],
         group: GRUPO_MILITAR,
         label: "E-mail FAB",
         hydrated: true,
         width: 28,
         get: (row) => get(row).email_fab,
      },
      {
         key: "email_pess",
         samples: [
            "fulano@exemplo.com",
            "beltrano@exemplo.com",
            "sicrana@exemplo.com",
         ],
         group: GRUPO_PESSOAL,
         label: "E-mail Pessoal",
         hydrated: true,
         width: 28,
         get: (row) => get(row).email_pess,
      },
   ];

   return all.filter((c) => !omit.has(c.key as MilitarColumnKey));
}
