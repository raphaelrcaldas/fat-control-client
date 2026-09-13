import {
   formatTime,
   isoDateToString,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { ExportColumn } from "@/components/export/exportTypes";
import type { EtapaExportItem } from "services/routes/estatistica/etapas";

const FLIGHT_DATA = "Dados do Voo";
const AIR_EFFORT = "Esforço Aéreo";
const CREW = "Tripulação";

function joinValues(values: string[]): string | null {
   return values.length > 0 ? values.join(" / ") : null;
}

/** Preserva a ordenacao cronologica que o antigo exportador da API aplicava. */
export function sortEtapasForExport<
   T extends Pick<EtapaExportItem, "data" | "dep" | "id">,
>(etapas: readonly T[]): T[] {
   return [...etapas].sort(
      (a, b) =>
         a.data.localeCompare(b.data) ||
         a.dep.localeCompare(b.dep) ||
         a.id - b.id
   );
}

/** Catálogo de colunas da planilha de etapas. */
export const etapasExportColumns: ExportColumn<EtapaExportItem>[] = [
   {
      key: "data",
      label: "Data",
      group: FLIGHT_DATA,
      required: true,
      align: "center",
      width: 12,
      samples: ["01/09/26", "02/09/26", "03/09/26"],
      get: (etapa) => isoDateToString(etapa.data),
   },
   {
      key: "origem",
      label: "Origem",
      group: FLIGHT_DATA,
      required: true,
      uppercase: true,
      align: "center",
      width: 10,
      samples: ["SBGL", "SBAN", "SBBR"],
      get: (etapa) => etapa.origem,
   },
   {
      key: "destino",
      label: "Destino",
      group: FLIGHT_DATA,
      required: true,
      uppercase: true,
      align: "center",
      width: 10,
      samples: ["SBAN", "SBBR", "SBGL"],
      get: (etapa) => etapa.destino,
   },
   {
      key: "dep",
      label: "DEP",
      group: FLIGHT_DATA,
      required: true,
      align: "center",
      width: 10,
      samples: ["08:00", "10:15", "14:30"],
      get: (etapa) => formatTime(etapa.dep),
   },
   {
      key: "arr",
      label: "ARR",
      group: FLIGHT_DATA,
      required: true,
      align: "center",
      width: 10,
      samples: ["09:30", "12:00", "16:10"],
      get: (etapa) => formatTime(etapa.arr),
   },
   {
      key: "tvoo",
      label: "TV",
      group: FLIGHT_DATA,
      required: true,
      align: "center",
      width: 10,
      samples: ["01:30", "01:45", "01:40"],
      get: (etapa) => minutesToTime(etapa.tvoo),
   },
   {
      key: "anv",
      label: "Aeronave",
      group: FLIGHT_DATA,
      required: true,
      uppercase: true,
      align: "center",
      width: 12,
      samples: ["2853", "2857", "2853"],
      get: (etapa) => etapa.anv,
   },
   {
      key: "pousos",
      label: "Pousos",
      group: FLIGHT_DATA,
      align: "right",
      width: 10,
      samples: ["1", "2", "1"],
      get: (etapa) => etapa.pousos,
   },
   {
      key: "nivel",
      label: "Nível",
      group: FLIGHT_DATA,
      uppercase: true,
      align: "center",
      width: 10,
      samples: ["FL180", "FL220", "FL200"],
      get: (etapa) => etapa.nivel,
   },
   {
      key: "tow",
      label: "TOW",
      group: FLIGHT_DATA,
      align: "right",
      samples: ["18000", "18500", "17900"],
      get: (etapa) => etapa.tow,
   },
   {
      key: "pax",
      label: "PAX",
      group: FLIGHT_DATA,
      align: "right",
      samples: ["12", "18", "9"],
      get: (etapa) => etapa.pax,
   },
   {
      key: "carga",
      label: "Carga",
      group: FLIGHT_DATA,
      align: "right",
      samples: ["1200", "950", "1400"],
      get: (etapa) => etapa.carga,
   },
   {
      key: "comb",
      label: "Combustível",
      group: FLIGHT_DATA,
      align: "right",
      samples: ["5400", "4900", "5200"],
      get: (etapa) => etapa.comb,
   },
   {
      key: "lub",
      label: "Lubrificante",
      group: FLIGHT_DATA,
      align: "right",
      samples: ["2", "1,5", "2,5"],
      get: (etapa) => etapa.lub,
   },
   {
      key: "tipo_missao_cod",
      label: "Cód. OI",
      group: AIR_EFFORT,
      uppercase: true,
      samples: ["TRP / AEV", "REVO", "TRP"],
      get: (etapa) =>
         joinValues(etapa.oi_etapas.map((oi) => oi.tipo_missao_cod)),
   },
   {
      key: "esforco_aereo",
      label: "Esforço Aéreo",
      group: AIR_EFFORT,
      samples: ["COMAE / COMPREP", "COMAE", "COMPREP"],
      get: (etapa) => joinValues(etapa.oi_etapas.map((oi) => oi.esf_aer)),
   },
   {
      key: "reg",
      label: "D/N/V",
      group: AIR_EFFORT,
      uppercase: true,
      align: "center",
      width: 10,
      samples: ["D / N", "V", "D"],
      get: (etapa) => joinValues(etapa.oi_etapas.map((oi) => oi.reg)),
   },
   {
      key: "tripulantes",
      label: "Tripulantes",
      group: CREW,
      uppercase: true,
      samples: ["ABC / DEF", "GHI / JKL", "MNO / PQR"],
      get: (etapa) => joinValues(etapa.tripulantes.map((trip) => trip.trig)),
   },
];
