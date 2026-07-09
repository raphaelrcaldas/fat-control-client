"use client";

import { useState, useMemo } from "react";
import {
   useDiariaValores,
   useGruposCidade,
   useGruposPg,
   type GetDiariaValoresParams,
} from "@/hooks/queries";
import type {
   GrupoCidadePublic,
   GrupoPgPublic,
} from "services/routes/admin/diarias";

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
   descricaoCidade: Record<number, string>;
   descricaoPg: Record<number, string>;
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
      isLoading: valoresLoading,
      isFetching,
      error,
   } = useDiariaValores(params);

   const { data: gruposCidade = [], isLoading: cidadeLoading } =
      useGruposCidade();
   const { data: gruposPg = [], isLoading: pgLoading } = useGruposPg();

   const isLoading = valoresLoading || cidadeLoading || pgLoading;

   // Mapa de cidades por grupo (derivado dos registros do banco)
   const cidadesByGrupo = useMemo(() => {
      const map = new Map<number, GrupoCidadePublic[]>();
      for (const gc of gruposCidade) {
         const arr = map.get(gc.grupo) ?? [];
         arr.push(gc);
         map.set(gc.grupo, arr);
      }
      return map;
   }, [gruposCidade]);

   // Lista de grupos unicos (registros do banco + grupos presentes nos valores)
   const uniqueGruposCidade = useMemo(() => {
      const fromRecords = gruposCidade.map((g) => g.grupo);
      const fromValores = valores.map((v) => v.grupo_cid);
      return Array.from(new Set([...fromRecords, ...fromValores])).sort(
         (a, b) => a - b
      );
   }, [gruposCidade, valores]);

   const uniqueGruposPg = useMemo(() => {
      const fromRecords = gruposPg.map((g) => g.grupo);
      const fromValores = valores.map((v) => v.grupo_pg);
      return Array.from(new Set([...fromRecords, ...fromValores])).sort(
         (a, b) => a - b
      );
   }, [gruposPg, valores]);

   // Descricoes derivadas dos proprios registros (banco como fonte unica)
   const descricaoCidade = useMemo(() => {
      const out: Record<number, string> = {};
      for (const [grupo, cidades] of cidadesByGrupo) {
         const ufs = Array.from(
            new Set(
               cidades
                  .map((c) => c.cidade?.uf)
                  .filter((uf): uf is string => Boolean(uf))
            )
         );
         out[grupo] = ufs.join(", ");
      }
      return out;
   }, [cidadesByGrupo]);

   const descricaoPg = useMemo(() => {
      const map = new Map<number, string[]>();
      for (const pg of gruposPg) {
         const arr = map.get(pg.grupo) ?? [];
         if (pg.pg_mid) arr.push(pg.pg_mid);
         map.set(pg.grupo, arr);
      }
      const out: Record<number, string> = {};
      for (const [grupo, mids] of map) {
         out[grupo] = mids.join(", ");
      }
      return out;
   }, [gruposPg]);

   return {
      valores,
      gruposCidade,
      gruposPg,
      isLoading,
      isFetching,
      error: error instanceof Error ? error : null,
      onlyActive,
      setOnlyActive,
      cidadesByGrupo,
      uniqueGruposCidade,
      uniqueGruposPg,
      descricaoCidade,
      descricaoPg,
   };
}
