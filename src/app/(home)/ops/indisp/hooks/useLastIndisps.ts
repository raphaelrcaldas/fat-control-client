import { useMemo } from "react";
import {
   CrewIndisp,
   CrewIndispList,
   IndispType,
} from "services/routes/indisps";

export interface LastIndispItem extends IndispType {
   trig: string;
   trip: CrewIndisp;
   /** deleted_at ?? updated_at ?? created_at — base da ordenação */
   lastChange: string;
   wasModified: boolean;
   isDeleted: boolean;
}

const MAX_ITEMS = 15;

/**
 * Deriva (memoizado) o feed "Últimas Atualizações" a partir do payload da
 * grade. O recorte (janela por date_end + função ativa) é intencional —
 * fora desse período não interessa.
 */
export function useLastIndisps(indisps: CrewIndispList[]): LastIndispItem[] {
   return useMemo(() => {
      return indisps
         .flatMap((item) =>
            item.indisps.map<LastIndispItem>((idp) => ({
               ...idp,
               trig: item.trip.trig,
               trip: item.trip,
               lastChange:
                  idp.deleted_at ?? idp.updated_at ?? idp.created_at ?? "",
               wasModified: !!idp.updated_at,
               isDeleted: !!idp.deleted_at,
            }))
         )
         .sort(
            (a, b) =>
               new Date(b.lastChange).getTime() -
               new Date(a.lastChange).getTime()
         )
         .slice(0, MAX_ITEMS);
   }, [indisps]);
}
