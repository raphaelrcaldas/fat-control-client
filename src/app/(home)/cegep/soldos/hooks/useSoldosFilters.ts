import { useMemo, useState } from "react";
import type { GetSoldosParams } from "@/hooks/queries";

/** Estado dos filtros da listagem de soldos + params normalizados pra query. */
export function useSoldosFilters() {
   const [circulo, setCirculo] = useState("");
   const [onlyActive, setOnlyActive] = useState(true);

   const queryParams = useMemo<GetSoldosParams>(
      () => ({
         circulo: circulo || undefined,
         activeOnly: onlyActive,
      }),
      [circulo, onlyActive]
   );

   return { circulo, setCirculo, onlyActive, setOnlyActive, queryParams };
}
