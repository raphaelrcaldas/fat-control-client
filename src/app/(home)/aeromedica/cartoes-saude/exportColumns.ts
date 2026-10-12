import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import { isoDateToString } from "@/../utils/dateHandler";
import {
   militarColumns,
   MILITAR_HYDRATED_COLUMNS,
} from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";
import { getDateStatus, getStatusConfig } from "./utils/dateStatus";

const GRUPO_CARTAO = "Cartão de Saúde";

const data = (iso: string | null | undefined) =>
   iso ? isoDateToString(iso) : null;

/** Farol de validade por extenso; sem data, celula vazia (nao "Sem data"). */
const farol = (iso: string | null | undefined) => {
   const status = getDateStatus(iso);
   return status === "empty" ? null : getStatusConfig(status).label;
};

/**
 * Catalogo de exportacao de /aeromedica/cartoes-saude: identidade militar
 * (o `UserPublic` aninhado em `.user`) mais o cartao.
 *
 * Sem hidratacao: a planilha sai so do que a listagem ja traz. Por isso a PII
 * (`MILITAR_HYDRATED_COLUMNS`) fica de fora — inclusive o telefone, que viaja
 * no `UserPublic` mas e dado pessoal. ID FAB, unidade e ultima promocao vem no
 * proprio `UserPublic` e entram como opcionais.
 */
export const CARTOES_SAUDE_EXPORT_COLUMNS: ExportColumn<UserCartaoSaude>[] = [
   ...militarColumns<UserCartaoSaude>((row) => row.user, {
      omit: MILITAR_HYDRATED_COLUMNS,
   }),
   {
      key: "tripulante",
      samples: ["Sim", "Sim", "Não"],
      group: GRUPO_CARTAO,
      label: "Tripulante",
      align: "center",
      width: 12,
      get: (row) => (row.tripulante ? "Sim" : "Não"),
   },
   {
      key: "prontuario",
      samples: ["12345", "23456", "34567"],
      group: GRUPO_CARTAO,
      label: "Prontuário",
      align: "center",
      width: 14,
      get: (row) => row.cartao?.prontuario,
   },
   {
      key: "cemal",
      samples: ["10/01/27", "15/06/26", "20/11/27"],
      group: GRUPO_CARTAO,
      label: "Validade CEMAL",
      align: "center",
      width: 16,
      get: (row) => data(row.cartao?.cemal),
   },
   {
      key: "farol_cemal",
      samples: ["Regular", "Atenção", "Vencido"],
      group: GRUPO_CARTAO,
      label: "Status CEMAL",
      align: "center",
      width: 14,
      get: (row) => farol(row.cartao?.cemal),
   },
   {
      key: "cemal_tem_ata",
      samples: ["Anexada", "Sem ata", "Anexada"],
      group: GRUPO_CARTAO,
      label: "Ata CEMAL",
      align: "center",
      width: 12,
      // `null` = sem CEMAL para ter ata; celula vazia, como na tela ("—").
      get: (row) =>
         row.cemal_tem_ata === null
            ? null
            : row.cemal_tem_ata
              ? "Anexada"
              : "Sem ata",
   },
   {
      key: "tovn",
      samples: ["01/02/27", "05/07/26", "09/12/27"],
      group: GRUPO_CARTAO,
      label: "Validade TOVN",
      align: "center",
      width: 16,
      get: (row) => data(row.cartao?.tovn),
   },
   {
      key: "farol_tovn",
      samples: ["Regular", "Crítico", "Regular"],
      group: GRUPO_CARTAO,
      label: "Status TOVN",
      align: "center",
      width: 14,
      get: (row) => farol(row.cartao?.tovn),
   },
   {
      key: "imae",
      samples: ["03/03/27", "08/08/26", "12/12/27"],
      group: GRUPO_CARTAO,
      label: "Validade IMAE",
      align: "center",
      width: 16,
      get: (row) => data(row.cartao?.imae),
   },
   {
      key: "farol_imae",
      samples: ["Regular", "Regular", "Atenção"],
      group: GRUPO_CARTAO,
      label: "Status IMAE",
      align: "center",
      width: 14,
      get: (row) => farol(row.cartao?.imae),
   },
];
