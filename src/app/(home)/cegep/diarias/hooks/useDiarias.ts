"use client";

import { useState, useMemo } from "react";
import { useDiariaValores, type GetDiariaValoresParams } from "@/hooks/queries";
import {
   grupoCidadeRecords,
   grupoPgRecords,
   getGruposCidadeUnicos,
   getGruposPgUnicos,
   cidadesByGrupoMap,
   type GrupoCidadePublic,
   type GrupoPgPublic,
} from "services/routes/cegep/diarias";

interface UseDiariasReturn {
   // Data
   valores: ReturnType<typeof useDiariaValores>["data"];
   gruposCidade: GrupoCidadePublic[];
   gruposPg: GrupoPgPublic[];

   // State
   isLoading: boolean;
   isFetching: boolean;
   error: Error | null;
   onlyActive: boolean;

   // Actions
   setOnlyActive: (value: boolean) => void;

   // Computed values
   cidadesByGrupo: Map<number, GrupoCidadePublic[]>;
   uniqueGruposCidade: number[];
   uniqueGruposPg: number[];
}

export function useDiarias(): UseDiariasReturn {
   const [onlyActive, setOnlyActive] = useState(true);

   const params: GetDiariaValoresParams = useMemo(
      () => ({
         activeOnly: onlyActive,
      }),
      [onlyActive]
   );

   const {
      data: valores = [],
      isLoading,
      isFetching,
      error,
   } = useDiariaValores(params);

   // Lista de grupos unicos (combinando estaticos com valores dinamicos)
   const uniqueGruposCidade = useMemo(() => {
      const gruposFromValores = valores.map((v) => v.grupo_cid);
      return Array.from(
         new Set([...getGruposCidadeUnicos(), ...gruposFromValores])
      ).sort((a, b) => a - b);
   }, [valores]);

   const uniqueGruposPg = useMemo(() => {
      const gruposFromValores = valores.map((v) => v.grupo_pg);
      return Array.from(
         new Set([...getGruposPgUnicos(), ...gruposFromValores])
      ).sort((a, b) => a - b);
   }, [valores]);

   return {
      valores,
      gruposCidade: grupoCidadeRecords,
      gruposPg: grupoPgRecords,
      isLoading,
      isFetching,
      error: error instanceof Error ? error : null,
      onlyActive,
      setOnlyActive,
      cidadesByGrupo: cidadesByGrupoMap,
      uniqueGruposCidade,
      uniqueGruposPg,
   };
}
