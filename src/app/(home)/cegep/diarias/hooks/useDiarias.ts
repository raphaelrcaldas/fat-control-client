"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "../../../../context/toast";
import {
   getDiariaValores,
   grupoCidadeRecords,
   grupoPgRecords,
   getGruposCidadeUnicos,
   getGruposPgUnicos,
   cidadesByGrupoMap,
   type DiariaValorPublic,
   type GrupoCidadePublic,
   type GrupoPgPublic,
} from "services/routes/cegep/diarias";

interface UseDiariasReturn {
   // Data
   valores: DiariaValorPublic[];
   gruposCidade: GrupoCidadePublic[];
   gruposPg: GrupoPgPublic[];

   // State
   loading: boolean;
   error: string | null;
   onlyActive: boolean;

   // Actions
   setOnlyActive: (value: boolean) => void;
   loadData: () => Promise<void>;

   // Computed values
   cidadesByGrupo: Map<number, GrupoCidadePublic[]>;
   uniqueGruposCidade: number[];
   uniqueGruposPg: number[];
}

export function useDiarias(): UseDiariasReturn {
   const [valores, setValores] = useState<DiariaValorPublic[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [onlyActive, setOnlyActive] = useState(true);

   const { push } = useToast();

   const loadData = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);

         // Apenas busca valores do servidor - grupos são estáticos
         const valoresData = await getDiariaValores(
            undefined,
            undefined,
            onlyActive
         );
         setValores(valoresData);
      } catch (err: unknown) {
         const errorMessage =
            err instanceof Error ? err.message : "Erro ao carregar dados";
         setError(errorMessage);
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   }, [onlyActive, push]);

   useEffect(() => {
      loadData();
   }, [loadData]);

   // Lista de grupos únicos (combinando estáticos com valores dinâmicos)
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
      loading,
      error,
      onlyActive,
      setOnlyActive,
      loadData,
      cidadesByGrupo: cidadesByGrupoMap,
      uniqueGruposCidade,
      uniqueGruposPg,
   };
}
