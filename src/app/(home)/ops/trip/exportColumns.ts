import type { CrewMember } from "services/routes/trips";
import { getOperLabel } from "@/constants/tripulantes";
import { isoDateToString } from "@/../utils/dateHandler";
import {
   militarColumns,
   MILITAR_HYDRATED_COLUMNS,
} from "@/components/export/militarColumns";
import type { ExportColumn } from "@/components/export/exportTypes";

const GRUPO_TRIP = "Tripulante";

/**
 * Catalogo de exportacao de /ops/trip.
 *
 * Identidade militar (vinda do `user` aninhado) mais o dominio proprio do
 * tripulante: trigrama, funcao, operacionalidade, projeto e data de OP.
 *
 * Sem hidratacao: a planilha sai so do que a listagem ja traz. A PII
 * (`MILITAR_HYDRATED_COLUMNS`) fica de fora — inclusive o telefone, que viaja
 * no `UserPublic` mas e dado pessoal. ID FAB, unidade e ultima promocao vem no
 * proprio `UserPublic` e entram como opcionais.
 *
 * E factory, e nao constante, porque o nome da funcao e dado por unidade
 * (`useFuncoes`) — nao ha lista fechada no codigo. O nome (`label`) chega de
 * fora para o catalogo nao precisar de hook.
 */
export function tripsExportColumns(
   funcLabel: (cod: string) => string
): ExportColumn<CrewMember>[] {
   return [
      ...militarColumns<CrewMember>((trip) => trip.user, {
         omit: MILITAR_HYDRATED_COLUMNS,
      }),
      {
         key: "trig",
         samples: ["SIL", "SOU", "PER"],
         group: GRUPO_TRIP,
         label: "Trigrama",
         uppercase: true,
         align: "center",
         width: 12,
         get: (trip) => trip.trig,
      },
      {
         key: "func",
         samples: ["PIL", "MEC", "OPE"],
         group: GRUPO_TRIP,
         label: "Função",
         uppercase: true,
         align: "center",
         width: 12,
         get: (trip) => trip.func,
      },
      {
         key: "func_nome",
         samples: ["Piloto", "Mecânico", "Comissário"],
         group: GRUPO_TRIP,
         label: "Descrição da Função",
         width: 24,
         get: (trip) => funcLabel(trip.func),
      },
      {
         key: "oper",
         samples: ["Operacional", "Instrutor", "Aluno"],
         group: GRUPO_TRIP,
         label: "Operacionalidade",
         align: "center",
         width: 18,
         get: (trip) => getOperLabel(trip.oper),
      },
      {
         key: "proj",
         samples: ["C-95", "C-98", "H-60"],
         group: GRUPO_TRIP,
         label: "Projeto",
         uppercase: true,
         align: "center",
         width: 14,
         get: (trip) => trip.proj,
      },
      {
         key: "data_op",
         samples: ["10/05/22", "22/08/23", "03/02/24"],
         group: GRUPO_TRIP,
         label: "Data de OP",
         align: "center",
         width: 14,
         get: (trip) => (trip.data_op ? isoDateToString(trip.data_op) : null),
      },
   ];
}
