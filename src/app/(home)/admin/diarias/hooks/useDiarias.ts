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
   /** undefined enquanto não há dado (carregando ou falha sem cache) */
   valores: ReturnType<typeof useDiariaValores>["data"];
   gruposCidade: GrupoCidadePublic[];
   gruposPg: GrupoPgPublic[];

   // State
   isLoading: boolean;
   isFetching: boolean;
   /** Primeira falha entre valores e grupos (cidade/posto): nenhuma some em silêncio */
   error: Error | null;
   onlyActive: boolean;

   // Actions
   setOnlyActive: (value: boolean) => void;
   /** Refaz só as queries que falharam */
   refetch: () => void;

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
      data: valoresData,
      isLoading: valoresLoading,
      isFetching: valoresFetching,
      error: valoresError,
      refetch: refetchValores,
   } = useDiariaValores(params);

   const {
      data: gruposCidadeData,
      isLoading: cidadeLoading,
      isFetching: cidadeFetching,
      error: cidadeError,
      refetch: refetchCidade,
   } = useGruposCidade();
   const {
      data: gruposPgData,
      isLoading: pgLoading,
      isFetching: pgFetching,
      error: pgError,
      refetch: refetchPg,
   } = useGruposPg();

   // Estáveis: um `= []` inline seria um array novo a cada render e
   // invalidaria todos os useMemo abaixo
   const valores = useMemo(() => valoresData ?? [], [valoresData]);
   const gruposCidade = useMemo(
      () => gruposCidadeData ?? [],
      [gruposCidadeData]
   );
   const gruposPg = useMemo(() => gruposPgData ?? [], [gruposPgData]);

   const isLoading = valoresLoading || cidadeLoading || pgLoading;
   const isFetching = valoresFetching || cidadeFetching || pgFetching;
   const error = valoresError ?? cidadeError ?? pgError;

   const refetch = () => {
      if (valoresError) refetchValores();
      if (cidadeError) refetchCidade();
      if (pgError) refetchPg();
   };

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
      valores: valoresData,
      gruposCidade,
      gruposPg,
      isLoading,
      isFetching,
      error: error instanceof Error ? error : null,
      onlyActive,
      setOnlyActive,
      refetch,
      cidadesByGrupo,
      uniqueGruposCidade,
      uniqueGruposPg,
      descricaoCidade,
      descricaoPg,
   };
}
