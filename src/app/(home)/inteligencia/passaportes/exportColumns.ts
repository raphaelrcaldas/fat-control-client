import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import { isoDateToString } from "@/../utils/dateHandler";
import {
   militarColumns,
   MILITAR_HYDRATED_COLUMNS,
   type MilitarColumnKey,
} from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";
import { getDateStatus, getStatusConfig } from "./utils/dateStatus";
import { getStatusPassaporteConfig } from "./utils/statusPassaporte";

/**
 * Identidade que a projecao de passaportes nao carrega (`id_fab`, `ult_promo`,
 * `unidade`) ou que fica de fora de proposito (PII, mesmo a que a listagem
 * traz). Sem hidratacao: a planilha sai so do que a tela ja tem em memoria.
 */
const OMIT: MilitarColumnKey[] = [
   ...MILITAR_HYDRATED_COLUMNS,
   "id_fab",
   "unidade",
   "ult_promo",
];

const GRUPO_PASSAPORTE = "Passaporte";
const GRUPO_VISTO = "Visto";

const data = (iso: string | null | undefined) =>
   iso ? isoDateToString(iso) : null;

/** Farol de validade por extenso; sem data, celula vazia (nao "Sem data"). */
const farol = (iso: string | null | undefined) => {
   const status = getDateStatus(iso);
   return status === "empty" ? null : getStatusConfig(status).label;
};

/**
 * Catalogo de exportacao de /inteligencia/passaportes: identidade militar
 * (linha achatada) mais passaporte e visto. A imagem anexada fica de fora — a
 * URL e assinada, expira, e so vem para quem tem `passaporte.image.view`.
 */
export const PASSAPORTES_EXPORT_COLUMNS: ExportColumn<TripPassaporteOut>[] = [
   ...militarColumns<TripPassaporteOut>((row) => row, { omit: OMIT }),
   {
      key: "status_passaporte",
      samples: ["Disponível", "Em missão", "Com o militar"],
      group: GRUPO_PASSAPORTE,
      label: "Situação",
      align: "center",
      width: 16,
      get: (row) =>
         row.passaporte
            ? getStatusPassaporteConfig(row.passaporte.status_passaporte).label
            : null,
   },
   {
      key: "passaporte",
      samples: ["FA000001", "FB000002", "FC000003"],
      group: GRUPO_PASSAPORTE,
      label: "Nº Passaporte",
      uppercase: true,
      align: "center",
      width: 16,
      get: (row) => row.passaporte?.passaporte,
   },
   {
      key: "data_expedicao_passaporte",
      samples: ["10/01/20", "15/06/21", "20/11/22"],
      group: GRUPO_PASSAPORTE,
      label: "Expedição Passaporte",
      align: "center",
      width: 20,
      get: (row) => data(row.passaporte?.data_expedicao_passaporte),
   },
   {
      key: "validade_passaporte",
      samples: ["10/01/30", "15/06/31", "20/11/32"],
      group: GRUPO_PASSAPORTE,
      label: "Validade Passaporte",
      align: "center",
      width: 20,
      get: (row) => data(row.passaporte?.validade_passaporte),
   },
   {
      key: "farol_passaporte",
      samples: ["Regular", "Atenção", "Vencido"],
      group: GRUPO_PASSAPORTE,
      label: "Status Validade Passaporte",
      align: "center",
      width: 26,
      get: (row) => farol(row.passaporte?.validade_passaporte),
   },
   {
      key: "visa",
      samples: ["V0000001", "V0000002", "V0000003"],
      group: GRUPO_VISTO,
      label: "Nº VISA",
      uppercase: true,
      align: "center",
      width: 16,
      get: (row) => row.passaporte?.visa,
   },
   {
      key: "data_expedicao_visa",
      samples: ["01/02/21", "05/07/22", "09/12/23"],
      group: GRUPO_VISTO,
      label: "Expedição VISA",
      align: "center",
      width: 16,
      get: (row) => data(row.passaporte?.data_expedicao_visa),
   },
   {
      key: "validade_visa",
      samples: ["01/02/31", "05/07/32", "09/12/33"],
      group: GRUPO_VISTO,
      label: "Validade VISA",
      align: "center",
      width: 16,
      get: (row) => data(row.passaporte?.validade_visa),
   },
   {
      key: "farol_visa",
      samples: ["Regular", "Crítico", "Regular"],
      group: GRUPO_VISTO,
      label: "Status Validade VISA",
      align: "center",
      width: 22,
      get: (row) => farol(row.passaporte?.validade_visa),
   },
];
