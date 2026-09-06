import type { CrewMember } from "services/routes/trips";
import { getOperLabel } from "@/constants/tripulantes";
import { isoDateToString } from "@/../utils/dateHandler";
import { militarColumns } from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";

/**
 * Catalogo de exportacao de /ops/trip.
 *
 * Identidade militar (vinda do `user` aninhado) mais o dominio proprio do
 * tripulante: trigrama, funcao, operacionalidade, projeto e data de OP.
 *
 * E factory, e nao constante, porque o nome da funcao e dado por unidade
 * (`useFuncoes`) — nao ha lista fechada no codigo. O `labelShort` chega de
 * fora para o catalogo nao precisar de hook.
 */
export function tripsExportColumns(
   funcLabel: (cod: string) => string
): ExportColumn<CrewMember>[] {
   return [
      ...militarColumns<CrewMember>((trip) => trip.user, { omit: ["nasc"] }),
      {
         key: "trig",
         samples: ["SIL", "SOU", "PER"],
         label: "Trigrama",
         uppercase: true,
         align: "center",
         width: 12,
         get: (trip) => trip.trig,
      },
      {
         key: "func",
         samples: ["PIL", "MEC", "OPE"],
         label: "Função",
         uppercase: true,
         align: "center",
         width: 12,
         get: (trip) => trip.func,
      },
      {
         key: "func_nome",
         samples: ["PILOTO", "MECÂNICO DE VOO", "OPERADOR DE EQUIPAMENTO"],
         label: "Descrição da Função",
         width: 24,
         get: (trip) => funcLabel(trip.func),
      },
      {
         key: "oper",
         samples: ["OPR", "INS", "ALN"],
         label: "Operacionalidade",
         align: "center",
         width: 18,
         get: (trip) => getOperLabel(trip.oper),
      },
      {
         key: "proj",
         samples: ["C-95", "C-98", "H-60"],
         label: "Projeto",
         uppercase: true,
         align: "center",
         width: 14,
         get: (trip) => trip.proj,
      },
      {
         key: "data_op",
         samples: ["10/05/22", "22/08/23", "03/02/24"],
         label: "Data de OP",
         align: "center",
         width: 14,
         get: (trip) => (trip.data_op ? isoDateToString(trip.data_op) : null),
      },
   ];
}
